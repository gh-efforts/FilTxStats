import { Controller, Post, Inject } from '@midwayjs/core';
import { MinerService } from '../service/miner';
import * as bull from '@midwayjs/bull';

@Controller('/cron')
export class CronController {
  @Inject()
  minerService: MinerService;

  @Inject()
  bullFramework: bull.Framework;

  @Post('/sync_miner_balance', {
    summary: '同步 miner 质押数据',
  })
  async syncMinerBalance() {
    return this.runJob('minerBalance');
  }

  async runJob(queueName: string, param: any = {}) {
    // 获取 Processor 相关的队列
    const bullQueue = this.bullFramework.ensureQueue(queueName);
    // 立即执行这个任务
    await bullQueue.add(param);
    return true;
  }
}
