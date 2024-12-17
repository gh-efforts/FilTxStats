import { Context, IProcessor, Processor } from '@midwayjs/bull';
import { Inject } from '@midwayjs/core';
import MyError from '../app/comm/myError';
import { MinerBalanceService } from '../app/service/minerBalance';

import { LarkSdk } from '@lark/core';

@Processor('minerBalance', {
  repeat: {
    cron: '*/20 * * * *',
  },
  removeOnComplete: true,
  removeOnFail: true,
  attempts: 0,
  backoff: {
    type: 'fixed',
    delay: 1000 * 60,
  },
})
export class MinerBalanceProcessor implements IProcessor {
  @Inject()
  logger;

  @Inject()
  ctx: Context;

  @Inject()
  service: MinerBalanceService;

  lark: LarkSdk;

  constructor() {
    this.lark = new LarkSdk();
  }

  async execute() {
    if (process.env.REAL_ENV !== 'prod') {
      this.logger.info(`${process.env.REAL_ENV}环境，不执行任务minerBalance`);
      return;
    }
    const { job } = this.ctx;
    try {
      await this.service.syncMinerBalance();
    } catch (error) {
      //此任务每5分钟执行一次，时间很短；且配置有 clearRepeatJobWhenStart: true； 会导致重试错误永远报不出来

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
        await this.lark.sendLarkByQueueStatus('节点余额', false, error.message);
        throw new MyError('syncMinerDailyStats error', error.message);
      }
    }
  }
}
