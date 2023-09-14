import { LarkSdk } from '@lark/core';

import { Context, IProcessor, Processor } from '@midwayjs/bull';
import { Inject } from '@midwayjs/core';
import MyError from '../app/comm/myError';
import { FilScanService } from '../app/service/filscan';

@Processor('filcoinNetwork', {
  repeat: {
    cron: '*/30 * * * *',
  },
  removeOnComplete: true,
  removeOnFail: true,
  attempts: 5,
  backoff: {
    type: 'fixed',
    delay: 1000 * 60,
  },
})
export class FilcoinNetworkProcessor implements IProcessor {
  @Inject()
  logger;

  @Inject()
  service: FilScanService;

  @Inject()
  ctx: Context;

  lark: LarkSdk;

  constructor() {
    this.lark = new LarkSdk();
  }

  async execute() {
    const { job } = this.ctx;
    try {
      await this.service.syncFilcoinNetworkData();
      await this.lark.sendLarkByQueueStatus('Filecoin 全网数据', true);
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
        await this.lark.sendLarkByQueueStatus(
          'Filecoin 全网数据',
          false,
          error.message
        );
        throw new MyError('syncMinerSnapshot error', error.message);
      }
    }
  }
}
