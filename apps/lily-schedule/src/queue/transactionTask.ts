import { Context, IProcessor, Processor } from '@midwayjs/bull';
import { ILogger, Inject } from '@midwayjs/core';
import MyError from '../app/comm/myError';
import { TransactionService } from '../app/service/transaction';

import { LarkSdk } from '@lark/core';

@Processor('transactionTask', {
  repeat: {
    cron: '0 */2 * * *',
  },
  removeOnComplete: true,
  removeOnFail: true,
  attempts: 5,
  backoff: {
    type: 'fixed',
    delay: 1000 * 60,
  },
})
export class TransactionTaskProcessor implements IProcessor {
  @Inject()
  logger: ILogger;

  @Inject()
  ctx: Context;

  @Inject()
  service: TransactionService;

  lark: LarkSdk;

  constructor() {
    this.lark = new LarkSdk();
  }

  async execute(params: { isHistory: boolean; transactionIds: number[] }) {
    if (process.env.REAL_ENV !== 'prod') {
      this.logger.info(
        `${process.env.REAL_ENV}环境，不执行任务 transactionTask`
      );
      return;
    }
    const { job } = this.ctx;
    try {
      if (params.isHistory) {
        //历史
        this.logger.info('transactionTask history, %s', params.isHistory);
        await this.service.syncTransaction();
      } else if (params.transactionIds) {
        //特定某些任务
        let tasks = await this.service.findTransactionSyncStatusByIds(
          params.transactionIds
        );
        this.logger.info(
          'transactionTask transactionIds, %s',
          params.transactionIds
        );
        if (tasks && tasks.length > 0) {
          for (let task of tasks) {
            return this.service.runJob('transaction', task);
          }
        }
      } else {
        //定时跑最新
        const transactionTask = await this.service.getTransactionSyncStatus();
        this.logger.info('transactionTask, %j', transactionTask);
        const unfinishedTask = transactionTask.filter(
          item => item.status === -1
        );
        unfinishedTask.map(task => {
          return this.service.runJob('transaction', task);
        });

        const finishedTasks = transactionTask.filter(item => item.status === 2);

        // 同步最新交易
        await this.service.syncLastTransaction(finishedTasks);
      }
      this.logger.info('========== Transaction success ===========');
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
