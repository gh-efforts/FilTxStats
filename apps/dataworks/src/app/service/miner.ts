import { MinerEntity, MinerMapping, MinerSnapshotMapping } from '@dws/entity';
import { FilfoxSdk } from '@filfox/http';
import * as bull from '@midwayjs/bull';
import { Config, Init, Inject, Provide } from '@midwayjs/core';
import { PixiuSdk } from '@pixiu/http';
import { BaseService } from '../../core/baseService';
import { SyncHisFromFilfoxDTO } from '../model/dto/miner';

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

  @Config('filfoxConfig.url')
  filfoxUrl;

  private pixiu: PixiuSdk;

  filfox: FilfoxSdk;

  @Init()
  async initMethod() {
    this.pixiu = new PixiuSdk(this.pixiuUrl);
    this.filfox = new FilfoxSdk(this.filfoxUrl);
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
          dateAt: new Date(),
        }),
      ]);
    }
    return true;
  }

  async syncMinerRewardByFilfox(param: SyncHisFromFilfoxDTO) {
    const { miner, startAt, endAt } = param;
    // 获取 Processor 相关的队列
    const minerRewardQueue = this.bullFramework.getQueue('minerReward');
    console.log('minerRewardQueue', minerRewardQueue);
    // 立即执行这个任务
    await minerRewardQueue.runJob({
      miner,
      startAt,
      endAt,
      isHisiory: true,
    });

    // const [startHeight, endHeight] = [
    //   getHeightByTime(startAt),
    //   getHeightByTime(endAt),
    // ];

    // const rewards = await this.filfox.getMinerReward(
    //   miner,
    //   startHeight,
    //   endHeight
    // );
    // console.log('records', rewards);
    // await this.minerSnapshotMapping.addMinerReward(records);
  }
}
