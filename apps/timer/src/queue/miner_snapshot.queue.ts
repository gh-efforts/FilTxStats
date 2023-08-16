import { IProcessor, Job, Processor } from '@midwayjs/bull';
import { Inject } from '@midwayjs/core';

@Processor('miner_snapshot', {
  repeat: {
    cron: '*/30 * * * *',
  },
  attempts: 5,
  backoff: {
    type: 'fixed',
    delay: 5000,
  },
})
export class MinerSnapshotProcessor implements IProcessor {
  @Inject()
  logger;

  @Inject()
  job: Job;

  async execute() {
    try {
      // TODO 每隔 30 分钟，获取一次节点快照数据
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
}
