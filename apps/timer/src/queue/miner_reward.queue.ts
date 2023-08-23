import { Context, IProcessor, Processor } from '@midwayjs/bull';
import { Inject } from '@midwayjs/core';
import MyError from '../app/comm/myError';
import { RewardService } from '../app/service/reward';

import { LarkSdk } from '@lark/core';

type MinerRewardParams = {
  miner: string;
  startAt: string;
  endAt: string;
  isHisiory: boolean;
};
@Processor('minerReward')
export class MinerRewardProcessor implements IProcessor {
  @Inject()
  logger;

  @Inject()
  ctx: Context;

  lark: LarkSdk;

  @Inject()
  rewardService: RewardService;

  constructor() {
    this.lark = new LarkSdk();
  }

  async execute(params: MinerRewardParams) {
    const { job } = this.ctx;
    console.log('params', params);
    const { miner, startAt, endAt, isHisiory } = params;

    try {
      if (isHisiory) {
        await this.rewardService.syncMinerRewardHistory(miner, startAt, endAt);
      }
    } catch (error) {
      // I/O 操作失败，记录日志并重试
      this.logger.error(`Job ${job.id} failed: ${error.message}`);
      const attemptsMade = job.attemptsMade + 1;
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
      }
      throw new MyError('syncMinerRewardHistory error', error.message);
    }
  }

  // TODO 计算 miner 奖励释放
  async rewardRelease() {}

  // TODO 计算 miner 冻结奖励释放明细
  async rewardReleaseRecord() {}
}
