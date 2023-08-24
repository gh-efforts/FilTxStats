import { Config, Init, Inject, Provide } from '@midwayjs/core';

import { FilfoxSdk } from '@filfox/http';
import { PixiuSdk } from '@pixiu/http';

import { getHeightByTime } from '@dws/utils';
import { InjectDataSource } from '@midwayjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

import { MinerService } from '../miner';
import { MinerLockedRewardService } from './minerLockedReward';
import { MinerReleaseRecordService } from './minerReleaseRecord';
import { MinerRewardService } from './minerReward';

import * as dayjs from 'dayjs';
import * as _ from 'lodash';
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
  minerService: MinerService;

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

  async syncMinerRewardLatest() {
    const t = await this.defaultDataSource.transaction();
    try {
      // 只找同步完历史的 miner
      const miners = await this.minerService.getMinerList();

      const params = [];

      miners.forEach(({ miner, rewardEndAt }) => {
        const startAt = dayjs(rewardEndAt).unix();
        const endAt = dayjs().subtract(1, 'hour').unix();
        // 只同步比当前时间早一个小时的交易数据（为了避免交易分叉，保证数据的准确性）
        if (startAt <= endAt) {
          params.push({
            miner,
            startAt,
            endAt,
          });
        }
      });

      const rewards = await Promise.all(
        params.map(param => {
          // 每个 miner 的奖励数据, 每个 miner 的上一次结束时间可能不通，保证数据部缺失
          return this.pixiu.getMinerRewardDetail(
            [param.miner],
            param.startAt,
            param.endAt
          );
        })
      );
      // 转换成 map 结构
      const minerRewardMap = _.keyBy(_.flatten(rewards), 'miner_id');
      console.log('minerRewardMap', minerRewardMap);
      if (Object.keys(minerRewardMap).length === 0) {
        return true;
      }

      for (const miner in minerRewardMap) {
        const reward = minerRewardMap[miner];
        const latestReward = _.maxBy(reward.Rewards, 'height');

        await Promise.all([
          this.minerRewardService.addMinerReward(reward.Rewards, t),
          this.minerLockedRewardService.addLockedReward(reward.Rewards, t),
          this.minerReleaseRecordService.releasePercent25ByFilfox(
            reward.Rewards,
            t
          ),
          await this.minerService.modifyMiner(
            {
              rewardEndAt: latestReward.time,
            },
            {
              miner,
            }
          ),
        ]);
      }
      await t.commit();
      return true;
    } catch (error) {
      console.log('error', error);
      await t.rollback();
      throw new MyError('同步最新奖励失败', 500, error.message);
    }
  }

  // 从 filfox 同步 miner 奖励历史
  async syncMinerRewardHistory(miner: string, startAt: string, endAt: string) {
    const t = await this.defaultDataSource.transaction();
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
        this.minerRewardService.addMinerReward(_.cloneDeep(rewards), t),
        this.minerLockedRewardService.addLockedReward(_.cloneDeep(rewards), t),
        this.minerReleaseRecordService.releasePercent25ByFilfox(
          _.cloneDeep(rewards),
          t
        ),
        this.minerReleaseRecordService.releaseHisLockedRewardByFilfox(
          _.cloneDeep(rewards),
          t
        ),
      ]);
      const reward = _.maxBy(rewards, 'height');
      // 保证一批数据是准确的
      await t.commit();
      return reward;
    } catch (error) {
      console.log('error', error);
      await t.rollback();
      throw new MyError('同步历史奖励失败', 500, error.message);
    }
  }
}
