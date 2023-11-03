import {
  FilcoinNetworkDataEntity,
  FilcoinNetworkDataMapping,
} from '@dws/entity';
import * as _ from 'lodash';
import { FilfoxSdk } from '@filfox/http';
import { FilscanSdk } from '@filscan/http';
import { Config, ILogger, Init, Inject, Logger, Provide } from '@midwayjs/core';
import { BaseService } from '../../core/baseService';
import { FILCACHEKEY } from '../comm/filcoin';
import RedisUtils from '../comm/redis';
import {
  ByTimeRangeDTO,
  INetworkByHeightVO,
  NetworkByHeightDTO,
} from '../model/dto/filcoin';
import { MessageGasEconomyMapping, NetworkMapping } from '@lily/entity';
import { bigSub } from 'happy-node-utils';
import { convertPowerToPiB, convertToFil, getHeightByTime } from '@dws/utils';
import BigNumber from 'bignumber.js';
import dayjs = require('dayjs');
import MyError from '../comm/myError';
import { PixiuSdk } from '@pixiu/http';

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

  @Logger()
  logger: ILogger;

  @Inject()
  messageGasEconomyMapping: MessageGasEconomyMapping;

  private filscan: FilscanSdk;

  private filfox: FilfoxSdk;

  @Config('pixiuConfig.url')
  pixiuUrl;

  pixiu: PixiuSdk;

  @Init()
  async initMethod() {
    this.filscan = new FilscanSdk(this.filscanUrl);
    this.filfox = new FilfoxSdk(this.filfoxUrl);
    this.pixiu = new PixiuSdk(this.pixiuUrl);
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
   * 全网新增有效算力: chain_powers  全网的算力数据在这里面
   * 全网新增原值算力
   * 全网产出奖励: chain_rewards
   * 全网惩罚: 惩罚 找vm_message表中 from是矿工第十  to是f099的数据字段value的和
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

  /**
   * 提供最近一小时全网的 gas32， gas64
   * 新版计算，直接调用貔貅
   * @param dto
   */
  public async getGasInfoByTimeNew(dto: ByTimeRangeDTO) {
    let { startTime, endTime } = dto;
    let gapDays = dayjs(startTime).diff(endTime, 'hour');
    if (gapDays > 12) {
      throw new MyError('时间范围不能超出 12 小时');
    }
    let startHeight = getHeightByTime(startTime);
    let endHeight = getHeightByTime(endTime);
    let ret = await this.pixiu.getAvgSealGas(startHeight, endHeight);
    this.logger.info('pixiu gas 返回, %s', ret);
    if (!ret) {
      throw new MyError('getAvgSealGas返回空');
    }
    return {
      gas32Avg: this.formatAvgSealGas(ret.sealGas32G),
      gas64Avg: this.formatAvgSealGas(ret.sealGas64G),
    };
  }

  private formatAvgSealGas(num) {
    return BigNumber(num).div(Math.pow(10, 18));
  }

  public async getMaxHeightBaseFee() {
    let ret = await this.messageGasEconomyMapping.getMasHeightBaseFee();
    return ret && ret.baseFee;
  }
}
