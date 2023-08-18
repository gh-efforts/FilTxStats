import { Context, IProcessor, Processor } from '@midwayjs/bull';
import { Inject } from '@midwayjs/core';
import { MinerDailyService } from '../app/service/minerDailyStats';
@Processor('minerDailyStats', {
  repeat: {
    // cron: '0 35 2 * * *',
    cron: '*/1 * * * *',
  },
  attempts: 5,
  backoff: {
    type: 'fixed',
    delay: 5000,
  },
})
export class MinerDailyStatsProcessor implements IProcessor {
  @Inject()
  logger;

  @Inject()
  ctx: Context;

  @Inject()
  service: MinerDailyService;

  async execute() {
    const { job } = this.ctx;

    try {
      console.log('job');
      await this.service.syncMinerDailyStats();
    } catch (error) {
      console.log('error', error);
      // I/O 操作失败，记录日志并重试
      this.logger.error(`Job ${job.id} failed: ${error.message}`);
      // TODO send lark message
      if (job.attemptsMade > job.opts.attempts) {
        // 重试该任务
        // await job.retry();
      }
    }
  }

  // TODO 计算 miner 奖励释放
  async rewardRelease() {}

  // TODO 计算 miner 冻结奖励释放明细
  async rewardReleaseRecord() {}
}
