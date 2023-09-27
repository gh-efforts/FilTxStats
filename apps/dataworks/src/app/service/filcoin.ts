import {
  FilcoinNetworkDataEntity,
  FilcoinNetworkDataMapping,
} from '@dws/entity';

import * as _ from 'lodash';

import { FilfoxSdk } from '@filfox/http';
import { FilscanSdk } from '@filscan/http';
import { Config, Init, Inject, Provide } from '@midwayjs/core';
import { BaseService } from '../../core/baseService';
import { FILCACHEKEY } from '../comm/filcoin';
import RedisUtils from '../comm/redis';
import { INetworkByHeightVO, NetworkByHeightDTO } from '../model/dto/filcoin';
import { NetworkMapping } from '@lily/entity';
import { bigSub } from 'happy-node-utils';
import { convertPowerToPiB, convertToFil } from '@dws/utils';
import BigNumber from 'bignumber.js';

@Provide()
export class FilcoinNetworkService extends BaseService<FilcoinNetworkDataEntity> {
  @Inject()
  mapping: FilcoinNetworkDataMapping;

  @Inject()
  networkMapping: NetworkMapping;

  @Inject()
  redisUtils: RedisUtils;

  @Config('filscanConfig.url')
  filscanUrl: string;

  @Config('filfoxConfig.url')
  filfoxUrl: string;

  private filscan: FilscanSdk;

  private filfox: FilfoxSdk;

  @Init()
  async initMethod() {
    this.filscan = new FilscanSdk(this.filscanUrl);
    this.filfox = new FilfoxSdk(this.filfoxUrl);
  }

  async getNetworkData() {
    try {
      const data = await this.filscan.getFilcoinNetworkData();
      const camelCase = {};
      Object.keys(data).forEach(key => {
        camelCase[_.camelCase(key)] = data[key];
      });
      return camelCase;
    } catch (error) {
      this.ctx.logger.error('network error', error);
      return this.mapping.getFilNetwork({
        order: [['createdAt', 'desc']],
      });
    }
  }

  async getMinerInfo(minerId: string) {
    const key = FILCACHEKEY.MINERINFO + minerId;
    const cache = await this.redisUtils.getString(key);
    if (cache) {
      return JSON.parse(cache);
    }
    const result = await this.filfox.getMinerDetail(minerId);

    const data = {
      // 账户余额
      balance: result.balance,
      // 节点长地址
      robust: result.robust,
      // 扇区大小
      sectorSize: result.miner.sectorSize,
      // 可用余额
      availableBalance: result.miner.availableBalance,
      // 扇区质押
      sectorPledgeBalance: result.miner.sectorPledgeBalance,
      // 锁仓奖励
      vestingFunds: result.miner.vestingFunds,
      // 预存款
      preCommitDeposits: result.miner.preCommitDeposits,
      // 有效算力
      qualityAdjPower: result.miner.qualityAdjPower,
      //原值算力
      rawBytePower: result.miner.rawBytePower,
      // 账户类型
      actor: result.actor === 'storageminer' ? 'miner' : 'account',
      owner: result.miner.owner.address,
      worker: result.miner.worker.address,
      beneficiary: result.miner.beneficiary.address,
      controlAddresses: result.miner.controlAddresses.map(c => c.address),
    };

    await this.redisUtils.setValue(key, JSON.stringify(data), 60);
    return data;
  }

  /**
   * 根据高度区间范围额查询网络数据
   * 全网新增有效算力
   * 全网新增原值算力
   * 全网产出奖励
   * 全网惩罚
   * @param dto
   * @returns
   */
  async getNetworkDataByHeight(dto: NetworkByHeightDTO) {
    let { minHeight, maxHeight } = dto;
    if (minHeight > maxHeight) {
      throw new Error('minHeight 大于 maxHeight');
    }
    let { growTotalRawBytesPower, growTotalQaBytesPower } =
      await this.getPowerByHeight(dto);
    let { totalMinedReward } = await this.getRewardByHeight(dto);
    let { totalvalue } = await this.networkMapping.getPenaltyByHeight(
      minHeight,
      maxHeight
    );
    let ret: INetworkByHeightVO = {
      growTotalRawBytesPower,
      growTotalQaBytesPower,
      totalMinedReward,
      totalPenalty: new BigNumber(totalvalue),
    };
    ret.format = {
      growTotalRawBytesPower: `${convertPowerToPiB(
        ret.growTotalRawBytesPower
      )} PiB`,
      growTotalQaBytesPower: `${convertPowerToPiB(
        ret.growTotalQaBytesPower
      )} PiB`,
      totalMinedReward: `${convertToFil(ret.totalMinedReward)} FIL`,
      totalPenalty: `${convertToFil(ret.totalPenalty)} FIL`,
    };
    return ret;
  }

  /**
   * 取范围区间内，height 最高，最低一条相减
   * @param param
   * @returns
   */
  private async getPowerByHeight(param: NetworkByHeightDTO) {
    let { minHeight, maxHeight } = param;
    let maxPower = await this.networkMapping.getPowerByMaxH(maxHeight);
    let minPower = await this.networkMapping.getPowerByMinH(minHeight);
    if (!maxPower) {
      throw new Error('maxPower null');
    }
    if (!minPower) {
      throw new Error('minPower null');
    }
    return {
      growTotalRawBytesPower: bigSub(
        maxPower.total_raw_bytes_power,
        minPower.total_raw_bytes_power
      ),
      growTotalQaBytesPower: bigSub(
        maxPower.total_qa_bytes_power,
        minPower.total_qa_bytes_power
      ),
    };
  }

  /**
   * 取范围区间内，height 最高，最低一条相减
   * @param param
   * @returns
   */
  private async getRewardByHeight(param: NetworkByHeightDTO) {
    let { minHeight, maxHeight } = param;
    let max = await this.networkMapping.getRewardByMaxH(maxHeight);
    let min = await this.networkMapping.getRewardByMinH(minHeight);
    if (!max) {
      throw new Error('maxReward null');
    }
    if (!min) {
      throw new Error('minReward null');
    }
    return {
      totalMinedReward: bigSub(max.total_mined_reward, min.total_mined_reward),
    };
  }
}
