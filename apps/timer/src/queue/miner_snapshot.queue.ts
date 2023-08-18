import { Context, IProcessor, Processor } from '@midwayjs/bull';
import { Inject } from '@midwayjs/core';
import { MinerSnapshotService } from '../app/service/minerSnapshot';
@Processor('minerSnapshot', {
  repeat: {
    cron: '*/1 * * * *',
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
  service: MinerSnapshotService;

  @Inject()
  ctx: Context;

  async execute() {
    const { job } = this.ctx;
    console.log('==============');
    try {
      // TODO 每隔 30 分钟，获取一次节点快照数据
      await this.service.syncMinerSnapshot();
    } catch (error) {
      // I/O 操作失败，记录日志并重试
      this.logger.error(`Job ${job.id} failed: ${error.message}`);
      if (job.attemptsMade < job.opts.attempts) {
        // 重试该任务
        await job.retry();
      } else {
        // TODO send lark message
      }
    }
  }
}
