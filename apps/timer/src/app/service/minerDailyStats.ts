import { Config, Init, Inject, Provide } from '@midwayjs/core';

import {
  MinerDailyStatsEntity,
  MinerDailyStatsMapping,
  MinerMapping,
} from '@dws/entity';
import { IGasFeeByDateRes, PixiuSdk } from '@pixiu/http';
import * as dayjs from 'dayjs';
import { BaseService } from '../../core/baseService';

@Provide()
export class MinerDailyService extends BaseService<MinerDailyStatsEntity> {
  @Inject()
  mapping: MinerDailyStatsMapping;

  @Inject()
  minerMapping: MinerMapping;

  @Config('pixiuConfig.url')
  pixiuUrl;

  pixiu: PixiuSdk;

  @Init()
  async initMethod() {
    this.pixiu = new PixiuSdk(this.pixiuUrl);
  }

  private _getMinerGas(minerGas: IGasFeeByDateRes[], method?: number) {
    return minerGas.map(item => {
      const {
        minerGasDetails,
        minerPenalty = 0,
        PreAndProveBatchBurn = [],
      } = item;
      let gas = 0;
      minerGasDetails?.forEach(gasDetail => {
        //  miner gas 费
        if (!method && gasDetail.method !== 5) {
          gas += Number(gasDetail.gas_fee);
        }
        // method = 5, 为扇区的 wp 消耗
        if (method && gasDetail.method === method) {
          gas += Number(gasDetail.gas_fee);
        }
      });

      PreAndProveBatchBurn?.forEach(gasDetail => {
        gas += Number(gasDetail.gas_fee);
      });

      gas += Number(minerPenalty);

      return {
        ...item,
        gas,
      };
    });
  }

  private _getMinerResult(miner: string, list: any[]) {
    const minerResult = list.find(
      item => item.miner_id === miner || item.minerId === miner
    );
    return minerResult || {};
  }

  async syncMinerDailyStats() {
    const date = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    const startAt = dayjs().subtract(1, 'day').startOf('day').valueOf();
    const endAt = dayjs().subtract(1, 'day').endOf('day').valueOf();
    const miners = (await this.minerMapping.getMinerList()).map(
      item => item.miner
    );

    const [gasFee, reward, dcSealed, pledge] = await Promise.all([
      this.pixiu.gasMinerGasFee(miners, date),
      this.pixiu.getMinerReward(miners, startAt, endAt),
      this.pixiu.getMinerDcSealed(miners, date),
      this.pixiu.getMinerPledge(miners, date),
    ]);

    const gasList = this._getMinerGas(gasFee);
    const wpList = this._getMinerGas(gasFee, 5);

    const minerDailyStats = miners.map(miner => {
      return {
        miner,
        reward: this._getMinerResult(miner, reward).reward || 0,
        powerIncrease24H: this._getMinerResult(miner, dcSealed).sealed || 0,
        gas: this._getMinerResult(miner, gasList).gas || 0,
        windowPost: this._getMinerResult(miner, wpList).gas || 0,
        pledgeConsume: this._getMinerResult(miner, pledge).pledge_incr || 0,
        pledgeReturn: this._getMinerResult(miner, pledge).pledge_reduce || 0,
        dateAt: date,
      };
    });
    await this.mapping.bulkCreateMinerDailyStats(minerDailyStats, {
      updateOnDuplicate: ['miner', 'dateAt'],
    });
  }
}
