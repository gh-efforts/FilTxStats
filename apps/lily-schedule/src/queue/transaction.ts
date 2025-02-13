import { Context, IProcessor, Processor } from '@midwayjs/bull';
import { Inject } from '@midwayjs/core';
import MyError from '../app/comm/myError';
import { TransactionService } from '../app/service/transaction';

import { TransactionSyncStatusEntity } from '@dws/entity';
import { LarkSdk } from '@lark/core';

@Processor('transaction', {
  removeOnComplete: true,
  removeOnFail: true,
  attempts: 2,
  backoff: {
    type: 'fixed',
    delay: 1000 * 60,
  },
})
export class TransactionProcessor implements IProcessor {
  @Inject()
  logger;

  @Inject()
  ctx: Context;

  @Inject()
  service: TransactionService;

  lark: LarkSdk;

  constructor() {
    this.lark = new LarkSdk();
  }

  async execute(params: TransactionSyncStatusEntity) {
    const { job } = this.ctx;
    // const { type } = params;
    try {
      // if (type === 1) {
      //   await this.service._getDerivedGasTransactionsAndSave(params);
      // } else {
      //   await this.service._getVmMessagesTransactionsAndSave(params);
      // }
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
        await this.lark.sendLarkByQueueStatus('节点类型', false, error.message);
        throw new MyError('syncMinerDailyStats error', error.message);
      }
    }
  }
}
