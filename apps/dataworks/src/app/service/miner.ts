import { Config, Init, Inject, Provide } from '@midwayjs/core';

import { MinerEntity } from '@dws/entity';
import { PixiuSdk } from '@pixiu/http';
import { BaseService } from '../../core/baseService';
import { MinerMapping } from '../mapping/dws/miner';
import { MinerSnapshotMapping } from '../mapping/dws/minerSnapshot';

@Provide()
export class MinerService extends BaseService<MinerEntity> {
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
}
