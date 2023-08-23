import { MinerEntity, MinerMapping, MinerSnapshotMapping } from '@dws/entity';
import * as bull from '@midwayjs/bull';
import { Config, Init, Inject, Provide } from '@midwayjs/core';
import { PixiuSdk } from '@pixiu/http';
import { BaseService } from '../../core/baseService';
import { SyncMinerRewardHistoryDTO } from '../model/dto/miner';

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

  @Init()
  async initMethod() {
    this.pixiu = new PixiuSdk(this.pixiuUrl);
  }

  async register(miners: string[]) {
    const [minerBases, minerSnapshots] = await Promise.all([
      this.pixiu.getMinerStaticState(miners),
      this.pixiu.getMinerBaseInfo(miners),
    ]);

    for (let miner of miners) {
      const [minerBase, minerSnapshot] = [
        minerBases.find(item => item.minerId === miner),
        minerSnapshots.find(item => item.miner_id === miner),
      ];

      const startAt = dayjs()
        .subtract(180, 'day')
        .format('YYYY-MM-DD HH:mm:ss');

      const endAt = dayjs().format('YYYY-MM-DD HH:mm:ss');

      await Promise.all([
        // 新增 miner
        this.mapping.addMiner({
          miner: minerBase.minerId,
          address: minerBase.address,
          sectoSize: minerBase.sector_size,
        }),
        // 新增当前时间快照
        this.minerSnapshotMapping.addMinerSnapshot({
          minerName: minerSnapshot.miner_id,
          rawPower: minerSnapshot.raw_byte_power || 0,
          power: minerSnapshot.quality_adj_power || 0,
          balance: minerSnapshot.balance || 0,
          pledge: minerSnapshot.initial_pledge || 0,
          lockFunds: minerSnapshot.locked_funds || 0,
        }),
      ]);

      // 开始同步历史数据
      await this.syncMinerRewardHistory({
        miner,
        startAt,
        endAt,
      });
    }
    return true;
  }

  async syncMinerRewardHistory(param: SyncMinerRewardHistoryDTO) {
    // 获取 Processor 相关的队列
    const minerRewardQueue = this.bullFramework.ensureQueue('minerReward');

    const opts = {
      // 失败可重试次数
      attempts: 5,
      // 固定 5 秒后开始重试
      backoff: {
        type: 'fixed',
        delay: 5000,
      },
    };
    // 立即执行这个任务
    await minerRewardQueue?.add(
      {
        ...param,
        isHisiory: true,
      },
      opts
    );
    return true;
  }
}
