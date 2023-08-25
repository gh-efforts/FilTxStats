import { Context, IProcessor, Processor } from '@midwayjs/bull';
import { Inject } from '@midwayjs/core';
import MyError from '../app/comm/myError';
import { MinerService } from '../app/service/miner';
import { RewardService } from '../app/service/reward';

import { LarkSdk } from '@lark/core';

type MinerRewardParams = {
  miner: string;
  startAt: string;
  endAt: string;
  isHisiory?: boolean;
};
@Processor('minerReward', {
  repeat: {
    cron: '0 */1 * * *',
  },
  removeOnComplete: true,
  removeOnFail: true,
  attempts: 5,
  backoff: {
    type: 'fixed',
    delay: 1000 * 60,
  },
})
export class MinerRewardProcessor implements IProcessor {
  @Inject()
  logger;

  @Inject()
  ctx: Context;

  @Inject()
  minerService: MinerService;

  @Inject()
  rewardService: RewardService;

  lark: LarkSdk;

  constructor() {
    this.lark = new LarkSdk();
  }

  async execute(params: MinerRewardParams) {
    const { job } = this.ctx;
    const { miner, startAt, endAt, isHisiory = false } = params;

    try {
      if (isHisiory) {
        const reward = await this.rewardService.syncMinerRewardHistory(
          miner,
          startAt,
          endAt
        );
        // 更新奖励状态字段
        await this.minerService.modifyMiner(
          {
            rewardEndAt: reward?.time || null,
            isSyncRewardHistory: true,
          },
          {
            miner,
          }
        );
      } else {
        await this.rewardService.syncMinerRewardLatest();
      }

      this.logger.info(
        `Job ${job.id} success, ${JSON.stringify(params)}`,
        '同步结束'
      );
    } catch (error) {
      console.log('error', error);
      const attemptsMade = job.attemptsMade + 1;

      // I/O 操作失败，记录日志并重试
      this.logger.error(`Job ${job.id} failed: ${error.message}`);
      this.logger.error(`Job: ${job.id} 任务已经重试的次数: `, attemptsMade);
      this.logger.error(
        `Job: ${job.id} 最多可以重试的次数: `,
        job.opts.attempts
      );
      // TODO send lark message
      if (attemptsMade < job.opts.attempts) {
        // 重试该任务
        this.logger.error(`Job ${job.id} start retry`);
      } else {
        this.logger.error(`Job ${job.id} retry failed`);
        await this.lark.larkNotify(error.message);
        throw new MyError('syncMinerRewardHistory error', error.message);
      }
    }
  }
}
