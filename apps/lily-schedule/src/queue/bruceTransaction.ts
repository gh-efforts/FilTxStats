import { Context, IProcessor, Processor } from '@midwayjs/bull';
import { Inject } from '@midwayjs/core';
import { IBruceTaskBody } from '../app/model/dto/transaction';
import { BruceService } from '../app/service/bruceService';

@Processor('bruceTransaction', {
  removeOnComplete: true,
  removeOnFail: true,
  attempts: 2,
  delay: 0,
  backoff: {
    type: 'fixed',
    delay: 1000 * 60,
  },
})
export class BruceTransactionProcessor implements IProcessor {
  @Inject()
  logger;

  @Inject()
  ctx: Context;

  @Inject()
  service: BruceService;

  constructor() {}

  async execute(params: IBruceTaskBody) {
    const { job } = this.ctx;
    try {
      this.logger.info('params:', params); //同步
      // await this.service.syncLilyMessages(params);
    } catch (error) {
      this.logger.error(error);
      const attemptsMade = job.attemptsMade + 1;

      // I/O 操作失败，记录日志并重试
      this.logger.warn(`Job ${job.id} failed: ${error.message}`);
      this.logger.warn(`Job: ${job.id} 任务已经重试的次数: `, attemptsMade);
      this.logger.warn(
        `Job: ${job.id} 最多可以重试的次数: `,
        job.opts.attempts
      );
      if (attemptsMade < job.opts.attempts) {
        // 重试该任务
        this.logger.warn(`Job ${job.id} start retry`);
      } else {
        this.logger.error(`Job ${job.id} retry failed`);
      }
    }
  }
}
