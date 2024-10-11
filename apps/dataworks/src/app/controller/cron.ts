import { Controller, Get, Inject } from '@midwayjs/core';
import * as bull from '@midwayjs/bull';

@Controller('/cron')
export class CronController {
  @Inject()
  bullFramework: bull.Framework;

  bullOpts: {
    removeOnComplete: true;
    removeOnFail: true;
    // 失败可重试次数
    attempts: 5;
    // 固定 5 秒后开始重试
    backoff: {
      type: 'fixed';
      delay: 5000;
    };
  };

  @Get('/sync/gh/aleo/transfer', { summary: '同步 gh aleo 算力' })
  async syncGhAleoTransfer() {
    // 获取 Processor 相关的队列
    const bullQueue = this.bullFramework.ensureQueue('syncGhAleoTransfer', {
      defaultJobOptions: this.bullOpts,
    });
    // 立即执行这个任务
    await bullQueue.add({});
    return true;
  }
}
