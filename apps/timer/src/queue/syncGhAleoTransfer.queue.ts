import { Context, IProcessor, Processor } from '@midwayjs/bull';
import { Inject } from '@midwayjs/core';
import { LarkSdk } from '@lark/core';
import { SyncGhAleoTransferService } from '../app/service/syncGhAleoTransfer';

@Processor('syncGhAleoTransfer', {
  //只执行一次，后续数据变更走 minerNodeChange 任务
  removeOnComplete: true,
  removeOnFail: true,
  attempts: 5,
  backoff: {
    type: 'fixed',
    delay: 1000 * 60,
  },
})
export class SyncGhAleoTransferProcessor implements IProcessor {
  @Inject()
  logger;

  @Inject()
  ctx: Context;

  @Inject()
  service: SyncGhAleoTransferService;

  lark: LarkSdk;

  constructor() {
    this.lark = new LarkSdk();
  }

  async execute() {
    const { job } = this.ctx;
    try {
      await this.service.syncAleo();
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
    }
  }
}
