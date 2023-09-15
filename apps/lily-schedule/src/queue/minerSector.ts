import { Context, IProcessor, Processor } from '@midwayjs/bull';
import { Inject } from '@midwayjs/core';
import MyError from '../app/comm/myError';
import { MinerSectorService } from '../app/service/minerSector';

import { LarkSdk } from '@lark/core';

@Processor('minerSector', {
  repeat: {
    cron: '0 50 2 * * *',
  },
  removeOnComplete: true,
  removeOnFail: true,
  attempts: 5,
  backoff: {
    type: 'fixed',
    delay: 1000 * 60,
  },
})
export class MinerSectorProcessor implements IProcessor {
  @Inject()
  logger;

  @Inject()
  ctx: Context;

  @Inject()
  service: MinerSectorService;

  lark: LarkSdk;

  constructor() {
    this.lark = new LarkSdk();
  }

  async execute() {
    const { job } = this.ctx;
    try {
      await this.service.syncMinersSector();
    } catch (error) {
      this.logger.error(error);
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
        await this.lark.sendLarkByQueueStatus('节点扇区', false, error.message);
        throw new MyError('syncMinerDailyStats error', error.message);
      }
    }
  }
}
