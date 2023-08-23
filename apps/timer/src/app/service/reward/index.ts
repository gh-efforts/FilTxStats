import { Config, Init, Inject, Provide } from '@midwayjs/core';

import { FilfoxSdk } from '@filfox/http';
import { PixiuSdk } from '@pixiu/http';

import { getHeightByTime } from '@dws/utils';
import { InjectDataSource } from '@midwayjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

import { MinerLockedRewardService } from './minerLockedReward';
import { MinerReleaseRecordService } from './minerReleaseRecord';
import { MinerRewardService } from './minerReward';

import MyError from '../../comm/myError';

@Provide()
export class RewardService {
  @Config('pixiuConfig.url')
  pixiuUrl;

  @Config('filfoxConfig.url')
  filfoxUrl;

  pixiu: PixiuSdk;

  filfox: FilfoxSdk;

  @InjectDataSource()
  defaultDataSource: Sequelize;

  @Inject()
  minerRewardService: MinerRewardService;

  @Inject()
  minerLockedRewardService: MinerLockedRewardService;

  @Inject()
  minerReleaseRecordService: MinerReleaseRecordService;

  @Init()
  async initMethod() {
    this.pixiu = new PixiuSdk(this.pixiuUrl);
    this.filfox = new FilfoxSdk(this.filfoxUrl);
  }

  // 从 filfox 同步 miner 奖励历史
  async syncMinerRewardHistory(miner: string, startAt: string, endAt: string) {
    const t = await this.defaultDataSource.transaction();
    throw Error('test message');
    try {
      const [startHeight, endHeight] = [
        getHeightByTime(startAt),
        getHeightByTime(endAt),
      ];
      const rewards = await this.filfox.getMinerReward(
        miner,
        startHeight,
        endHeight
      );
      await Promise.all([
        this.minerRewardService.addMinerReward(rewards, t),
        this.minerLockedRewardService.addLockedReward(rewards, t),
        this.minerReleaseRecordService.releasePercent25ByFilfox(rewards, t),
        this.minerReleaseRecordService.releaseHisLockedRewardByFilfox(
          rewards,
          t
        ),
      ]);
      // 保证一批数据是准确的
      await t.commit();
      return true;
    } catch (error) {
      console.log('error', error);
      await t.rollback();
      throw new MyError('同步历史奖励失败', 500, error.message);
    }
  }
}
