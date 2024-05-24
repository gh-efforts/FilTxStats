import {
  MinerEntity,
  MinerMapping,
  MinerSnapshotMapping,
  MinerTypeMapping,
} from '@dws/entity';
import { LilyMapping } from '@lily/entity';
import { LotusSdk } from '@lotus/http';
import * as bull from '@midwayjs/bull';
import { Config, Init, Inject, Provide } from '@midwayjs/core';
import { BaseService } from '../../core/baseService';
import {
  SectorSizeDTO,
  SyncMinerRewardHistoryDTO,
  UpdateMinerTypeDTO,
  AddMinerTypeDTO,
} from '../model/dto/miner';
import dayjs = require('dayjs');

@Provide()
export class MinerService extends BaseService<MinerEntity> {
  @Inject()
  bullFramework: bull.Framework;

  @Inject()
  mapping: MinerMapping;

  @Inject()
  lilyMapping: LilyMapping;

  @Inject()
  minerSnapshotMapping: MinerSnapshotMapping;

  @Inject()
  minerTypeMapping: MinerTypeMapping;

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
  @Config('lotusConfig')
  lotusConfig: {
    url: string;
    token: string;
  };

  lotus: LotusSdk;

  @Init()
  async initMethod() {
    this.lotus = new LotusSdk(this.lotusConfig.url, this.lotusConfig.token);
  }

  async register(miners: string[]) {
    // 注册 miner
    await Promise.all(
      miners.map(miner => {
        return this.mapping.upsertMiner(
          {
            miner,
            address: '',
            sectorSize: 0,
          },
          {
            fields: ['miner'],
          }
        );
      })
    );

    // 同步昨日 miner 的收益
    await this.runJob('minerDailyStats');
    // 同步 miner 的最新快照
    await this.runJob('minerSnapshot');
    // 当新增完 miner 后， 开始同步 miner 的基础信息
    await this.runJob('minerBaseInfo');
    // 当新增完 miner 后, 同步 miner 的类型
    // await this.runJob('minerType', {
    //   miners,
    // });
    // 同步 miner 的历史奖励
    await this.syncHisMinerReward({
      miners,
      startAt: '2022-12-20',
      endAt: dayjs().format('YYYY-MM-DD'),
      isHisiory: true,
    });
    miners.map(miner => {
      this.runJob('minerNode', {
        miner,
      });
    });
    return true;
  }

  async getMinerSectorSize(params: SectorSizeDTO) {
    const { miners } = params;
    // 查询扇区大小
    const sectorSizes = await Promise.all(
      miners.split(',').map(miner => this.lotus.getStateMinerInfo(miner))
    );

    return sectorSizes.map(item => {
      return {
        miner: item.miner,
        sectorSize: +item.sectorsize,
      };
    });
  }

  async syncHisMinerReward(params: SyncMinerRewardHistoryDTO) {
    if (!params || !params.miners) {
      await this.runJob('minerReward');
      return true;
    }
    const { miners, startAt, endAt } = params;
    for (let miner of miners) {
      await this.runJob('minerReward', {
        miner,
        startAt,
        endAt,
        isHisiory: true,
      });
    }
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

  async update(params: UpdateMinerTypeDTO) {
    const miner = await this.mapping
      .getModel()
      .findOne({ where: { miner: params.miner } });

    if (!miner) {
      return true;
    }

    await miner.update(params);
  }

  async addMinerType(params: AddMinerTypeDTO) {
    const res = await this.minerTypeMapping.saveNew(params);
    return res;
  }
}
