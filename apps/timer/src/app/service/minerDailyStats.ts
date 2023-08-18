import { Config, Init, Inject, Provide } from '@midwayjs/core';

import {
  MinerDailyStatsEntity,
  MinerDailyStatsMapping,
  MinerMapping,
} from '@dws/entity';
import { PixiuSdk } from '@pixiu/http';
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

  async syncMinerDailyStats() {
    console.log('======启动');
    const date = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    const startAt = dayjs().subtract(1, 'day').startOf('day').valueOf();
    const endAt = dayjs().subtract(1, 'day').endOf('day').valueOf();
    const miners = await this.minerMapping.getMinerList();

    const [gasFee, reward, dcSealed, pledge] = await Promise.all([
      this.pixiu.gasMinerGasFee(miners, date),
      this.pixiu.getMinerReward(miners, startAt, endAt),
      this.pixiu.getMinerDcSealed(miners, date),
      this.pixiu.getMinerPledge(miners, date),
    ]);
    console.log(
      'gasFee, reward, dcSealed, pledge',
      gasFee,
      reward,
      dcSealed,
      pledge
    );
  }
}
