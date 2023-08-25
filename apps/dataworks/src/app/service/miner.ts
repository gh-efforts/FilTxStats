import { MinerEntity, MinerMapping, MinerSnapshotMapping } from '@dws/entity';
import * as bull from '@midwayjs/bull';
import { Config, Init, Inject, Provide } from '@midwayjs/core';
import { PixiuSdk } from '@pixiu/http';
import { BaseService } from '../../core/baseService';

import * as dayjs from 'dayjs';

@Provide()
export class MinerService extends BaseService<MinerEntity> {
  @Inject()
  bullFramework: bull.Framework;

  @Inject()
  mapping: MinerMapping;

  @Inject()
  minerSnapshotMapping: MinerSnapshotMapping;

  @Config('pixiuConfig.url')
  pixiuUrl;

  private pixiu: PixiuSdk;

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

  @Init()
  async initMethod() {
    this.pixiu = new PixiuSdk(this.pixiuUrl);
  }

  async register(miners: string[]) {
    const minerBases = await this.pixiu.getMinerStaticState(miners);

    await this.runJob('minerDailyStats');
    await this.runJob('minerSnapshot');
    for (let miner of miners) {
      const minerBase = minerBases.find(item => item.minerId === miner);
      if (!minerBase) {
        this.ctx.logger.error('miner base not found', miner);
        continue;
      }

      const startAt = dayjs()
        .subtract(180, 'day')
        .format('YYYY-MM-DD HH:mm:ss');

      const endAt = dayjs().format('YYYY-MM-DD HH:mm:ss');

      await Promise.all([
        // 新增 miner 基础信息
        this.mapping.addMiner({
          miner: minerBase.minerId,
          address: minerBase.address,
          sectoSize: minerBase.sector_size,
        }),
        this.runJob('minerReward', {
          miner,
          startAt,
          endAt,
          isHisiory: true,
        }),
      ]);
    }

    return true;
  }

  async runJob(queueName: string, param: any = {}) {
    // 获取 Processor 相关的队列
    const bullQueue = this.bullFramework.ensureQueue(queueName);
    // 立即执行这个任务
    await bullQueue.add(param);
    return true;
  }
}
