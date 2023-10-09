import { Config, ILogger, Init, Inject, Provide } from '@midwayjs/core';

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
import { Transaction } from 'sequelize';
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
  mrs: MinerRewardService;

  @Inject()
  mlrs: MinerLockedRewardService;

  @Inject()
  mrrs: MinerReleaseRecordService;

  @Inject()
  logger: ILogger;

  @Init()
  async initMethod() {
    this.pixiu = new PixiuSdk(this.pixiuUrl);
    this.filfox = new FilfoxSdk(this.filfoxUrl);
  }

  // 释放锁仓奖励
  public async releaseLockedReward(t: Transaction) {
    // 获取上个时间点的小时
    const hour = dayjs().subtract(1, 'hour').hour();
    // 严格获取当前小时的高度
    const nowHeight = getHeightByTime(dayjs().format('YYYY-MM-DD HH:00:00'));
    // 获取释放记录
    const records = await this.mlrs.getLockedRewardByRelease(hour);
    // 保存释放记录
    await this.mrrs.BulkReleaseLockedReward(records, t);
    // 将释放到180天的冻结奖励改为完成状态
    await this.mlrs.completeRecord(nowHeight, t);
    return true;
  }

  async syncMinerRewardLatest() {
    this.logger.info('syncMinerRewardLatest 开始执行');
    const t = await this.defaultDataSource.transaction();

    try {
      const miners = await this.minerService.getMinerList();

      const params = [];

      miners.forEach(({ miner, rewardEndAt }) => {
        const startAt = rewardEndAt
          ? dayjs(rewardEndAt).unix()
          : dayjs().subtract(2, 'hour').unix();

        const endAt = dayjs().subtract(1, 'hour').unix();
        // 只同步比当前时间早一个小时的交易数据（为了避免交易分叉，保证数据的准确性）
        if (startAt <= endAt) {
          this.logger.info(
            'syncMinerRewardLatest 参数 %s, %s, %s',
            miner,
            dayjs(startAt).format(),
            dayjs(endAt).format()
          );
          params.push({
            miner,
            startAt,
            endAt,
          });
        }
      });

      const rewards = await Promise.all(
        params.map(param => {
          // 每个 miner 的奖励数据, 每个 miner 的上一次结束时间可能不同，保证数据部缺失
          return this.pixiu.getMinerRewardDetail(
            [param.miner],
            param.startAt,
            param.endAt
          );
        })
      );

      // 转换成 map 结构
      const minerRewardMap = _.keyBy(_.flatten(rewards), 'miner_id');

      let mapKeyLen = Object.keys(minerRewardMap).length;
      if (mapKeyLen === 0) {
        this.logger.info('syncMinerRewardLatest minerRewardMap空');
        // 释放事务
        await t.commit();
        return true;
      }
      this.logger.info('syncMinerRewardLatest minerRewardMap=', mapKeyLen);

      for (const miner in minerRewardMap) {
        const reward = minerRewardMap[miner];
        const latestReward = _.maxBy(reward.Rewards, 'height');

        this.logger.info(
          'syncMinerRewardLatest写入reward, %s',
          reward.Rewards && reward.Rewards.length
        );

        await Promise.all([
          this.mrs.addMinerReward(reward.Rewards, t),
          this.mlrs.addLockedReward(reward.Rewards, t),
          this.mrrs.releasePercent25(reward.Rewards, t),
          this.releaseLockedReward(t),
        ]);

        if (latestReward && latestReward.time) {
          await this.minerService.modifyMiner(
            {
              rewardEndAt: latestReward.time,
            },
            {
              miner,
            }
          );
        }
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
    const [startHeight, endHeight] = [
      getHeightByTime(startAt),
      getHeightByTime(endAt),
    ];

    try {
      // 获取 filfox 历史数据
      const rewards = await this.filfox.getMinerReward(
        miner,
        startHeight,
        endHeight
      );

      if (rewards.length === 0) {
        return null;
      }

      const chunks = _.chunk(rewards, 500);
      for (const chunk of chunks) {
        const t = await this.defaultDataSource.transaction();
        try {
          // 插入数据
          await Promise.all([
            this.mrs.addMinerReward(chunk, t),
            this.mlrs.addLockedReward(chunk, t),
            this.mrrs.releasePercent25(chunk, t),
            this.mrrs.releaseHisLockedReward(chunk, t),
          ]);
          const reward = _.maxBy(chunk, 'height');
          // 更新奖励状态字段
          await this.minerService.modifyMiner(
            {
              rewardEndAt: reward?.time || null,
            },
            {
              miner,
            },
            {
              transaction: t,
            }
          );
          await t.commit();
        } catch (error) {
          await t.rollback();
          throw new MyError('同步历史奖励失败', 500, error.message);
        }
      }

      return _.maxBy(rewards, 'height');
    } catch (error) {
      console.log('error', error);
      throw new MyError('同步历史奖励失败', 500, error.message);
    }
  }
}
