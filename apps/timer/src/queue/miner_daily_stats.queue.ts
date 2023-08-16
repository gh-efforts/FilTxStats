import { IProcessor, Job, Processor } from '@midwayjs/bull';
import { Inject } from '@midwayjs/core';

@Processor('miner', {
  repeat: {
    cron: '0 35 2 * * *',
  },
  attempts: 5,
  backoff: {
    type: 'fixed',
    delay: 5000,
  },
})
export class MinerDailyStatsProcessor implements IProcessor {
  @Inject()
  logger;

  @Inject()
  job: Job;

  async execute() {
    try {
      // TODO 每天晚上 2 点 35 分执行同步 miner 昨日数据
    } catch (error) {
      // I/O 操作失败，记录日志并重试
      console.error(`Job ${this.job.id} failed: ${error.message}`);
      if (this.job.attemptsMade < this.job.opts.attempts) {
        // 重试该任务
        await this.job.retry();
      } else {
        // TODO send lark message
      }
    }
  }

  // TODO 计算 miner 奖励释放
  async rewardRelease() {}

  // TODO 计算 miner 冻结奖励释放明细
  async rewardReleaseRecord() {}
}
