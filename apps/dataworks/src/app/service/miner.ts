import { MinerEntity, MinerMapping, MinerSnapshotMapping } from '@dws/entity';
import * as bull from '@midwayjs/bull';
import { Inject, Provide } from '@midwayjs/core';
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

  async register(miners: string[]) {
    for (let miner of miners) {
      // 注册 miner 基础信息
      await this.mapping.addMiner({
        miner,
        address: '',
        sectoSize: 0,
      });
      const startAt = dayjs()
        .subtract(180, 'day')
        .format('YYYY-MM-DD HH:mm:ss');

      const endAt = dayjs().format('YYYY-MM-DD HH:mm:ss');

      await this.runJob('minerReward', {
        miner,
        startAt,
        endAt,
        isHisiory: true,
      });
    }
    // 同步昨日 miner 的收益
    await this.runJob('minerDailyStats');
    // 同步 miner 的最新快照
    await this.runJob('minerSnapshot');
    // 当新增完 miner 后， 开始同步 miner 的基础信息
    await this.runJob('minerBaseInfo');

    return true;
  }

  async runJob(queueName: string, param: any = {}) {
    // 获取 Processor 相关的队列
    const bullQueue = this.bullFramework.ensureQueue(queueName, {
      defaultJobOptions: this.bullOpts,
    });
    // 立即执行这个任务
    await bullQueue.add(param);
    return true;
  }
}
