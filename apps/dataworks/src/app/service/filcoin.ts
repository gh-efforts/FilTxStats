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
  Gas32TrimMap,
  INetworkByHeightVO,
  NetworkByHeightDTO,
} from '../model/dto/filcoin';
import { NetworkMapping, gasMethod } from '@lily/entity';
import { bigDiv, bigSub } from 'happy-node-utils';
import { convertPowerToPiB, convertToFil, getHeightByTime } from '@dws/utils';
import BigNumber from 'bignumber.js';
import dayjs = require('dayjs');
import MyError from '../comm/myError';

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
   * 提供最近一小时全网的 gas32， gas64（粗略版本，一个小时内的封装的GAS 原则是要算整个封装过程的GAS。一个扇区的封装pre可能在1点发的，pro可能要到8点 ，都不是在一个区间的）
   * 方法：
   * 1. 从 derived_gas_outputs 按照最近一小时 height 查询，method in (PreCommitSector, ProveCommitSector) 中的记录
   * 2. 从 miner_infos 中查询 sector_size = 32G 的 miner
   * 3. 从 1 中按照 2 过滤出 32G 的封装消息记录， 并且 PreCommitSector,ProveCommitSector 一一对应（按照时间，一般 pre 会 比 prove 多，直接抛掉），最终的封装数量 = min(PreCommitSector,ProveCommitSector);
   * 4. 用 gas / 封装数量 得到 32G 消耗数量
   * 5. 64G 结果 = 32G 最终结果 / 2
   *
   * @param dto
   */
  public async getGasInfoByTime(dto: ByTimeRangeDTO) {
    let { startTime, endTime } = dto;
    let gapDays = dayjs(startTime).diff(endTime, 'hour');
    if (gapDays > 12) {
      throw new MyError('时间范围不能超出 12 小时');
    }
    let startHeight = getHeightByTime(startTime);
    let endHeight = getHeightByTime(endTime);
    let gasData = await this.networkMapping.getGas32Data(
      startHeight,
      endHeight
    );
    if (_.isEmpty(gasData)) {
      throw new MyError('lily查无 gas 数据');
    }

    //pre,prove 一一对应
    let minerMap: Map<string, Gas32TrimMap> = new Map();
    gasData.forEach(gas => {
      let val = minerMap.get(gas.to);
      if (!val) {
        val = {
          preCommitSectorRecords: [],
          proveCommitSectorRecords: [],
          sectorCount: 0,
        };
        minerMap.set(gas.to, val);
      }
      if (gas.method == gasMethod.PreCommitSector) {
        val.preCommitSectorRecords.push(gas);
      }
      if (gas.method == gasMethod.ProveCommitSector) {
        val.proveCommitSectorRecords.push(gas);
      }
    });

    let sumGas = BigNumber(0);
    let sumSectorCount = BigNumber(0);
    for (let [, v] of minerMap) {
      let sectorCount = Math.min(
        v.preCommitSectorRecords.length,
        v.proveCommitSectorRecords.length
      );
      v.sectorCount = sectorCount;
      if (sectorCount == 0) {
        continue;
      }
      //计算 avgGas
      let sum = BigNumber(0);
      v.preCommitSectorRecords.slice(0, sectorCount).forEach(n => {
        sum = BigNumber(sum)
          .plus(n.base_fee_burn)
          .plus(n.over_estimation_burn)
          .plus(n.miner_tip);
      });
      v.proveCommitSectorRecords.slice(0, sectorCount).forEach(n => {
        sum = BigNumber(sum)
          .plus(n.base_fee_burn)
          .plus(n.over_estimation_burn)
          .plus(n.miner_tip);
      });

      sumGas = sumGas.plus(sum);
      sumSectorCount = sumSectorCount.plus(sectorCount);
    }

    //对所有 miner 的 avgGas 再次 avg
    let tbSector = bigDiv(sumSectorCount.multipliedBy(32), 1024);
    let ret32 = bigDiv(convertToFil(sumGas), tbSector).toFixed(18); //单位  Fil/Tib
    let ret64 = bigDiv(convertToFil(sumGas), tbSector).div(2).toFixed(18); //单位
    this.logger.info(
      `timeGas,gas=%s,size=%s,ret=%s,%s`,
      sumGas,
      sumSectorCount,
      ret32,
      ret64
    );
    return {
      gas32Avg: ret32,
      gas64Avg: ret64,
    };
  }
}
