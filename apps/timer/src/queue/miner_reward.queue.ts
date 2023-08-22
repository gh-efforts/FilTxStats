import { Context, IProcessor, Processor } from '@midwayjs/bull';
import { Inject } from '@midwayjs/core';
// import { getHeightByTime } from '@dws/utils';

@Processor('minerReward')
export class MinerRewardProcessor implements IProcessor {
  @Inject()
  logger;

  @Inject()
  ctx: Context;

  async execute(params) {
    const { job } = this.ctx;
    console.log('params', params);

    try {
    } catch (error) {
      console.log('error', error);
      // I/O 操作失败，记录日志并重试
      this.logger.error(`Job ${job.id} failed: ${error.message}`);
      // TODO send lark message
      if (job.attemptsMade > job.opts.attempts) {
        // 重试该任务
        // await job.retry();
      }
    }
  }

  // TODO 计算 miner 奖励释放
  async rewardRelease() {}

  // TODO 计算 miner 冻结奖励释放明细
  async rewardReleaseRecord() {}
}
