import { Context, IProcessor, Processor } from '@midwayjs/bull';
import { Inject } from '@midwayjs/core';
import MyError from '../app/comm/myError';
import { MinerNodeService } from '../app/service/minerNode';

import { LarkSdk } from '@lark/core';
@Processor('minerNode', {
  removeOnComplete: true,
  removeOnFail: true,
  attempts: 5,
  backoff: {
    type: 'fixed',
    delay: 1000 * 60,
  },
})
export class MinerNodeProcessor implements IProcessor {
  @Inject()
  logger;

  @Inject()
  ctx: Context;

  @Inject()
  service: MinerNodeService;

  lark: LarkSdk;

  constructor() {
    this.lark = new LarkSdk();
  }

  async execute(params: { miner: string }) {
    const { job } = this.ctx;
    try {
      this.logger.info('minerNode param', params);
      await this.service.saveNodes(params.miner);
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
          '节点昨日统计',
          false,
          error.message
        );
        throw new MyError('syncMinerDailyStats error', error.message);
      }
    }
  }
}
