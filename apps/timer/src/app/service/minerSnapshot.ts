import { Config, Init, Inject, Provide } from '@midwayjs/core';

import { MinerSnapshotEntity } from '@dws/entity';
import { PixiuSdk } from '@pixiu/http';
import { BaseService } from '../../core/baseService';
import { MinerMapping } from '../mapping/dws/miner';
import { MinerSnapshotMapping } from '../mapping/dws/minerSnapshot';

@Provide()
export class MinerSnapshotService extends BaseService<MinerSnapshotEntity> {
  @Inject()
  mapping: MinerSnapshotMapping;

  @Inject()
  minerMapping: MinerMapping;

  @Config('pixiuConfig.url')
  pixiuUrl;

  pixiu: PixiuSdk;

  @Init()
  async initMethod() {
    this.pixiu = new PixiuSdk(this.pixiuUrl);
  }

  async syncMinerSnapshot() {
    const miners = await this.minerMapping.getMinerList();
    const minerSnapshots = await this.pixiu.getMinerBaseInfo(miners);

    for (let miner of miners) {
      const minerSnapshot = minerSnapshots.find(
        item => item.miner_id === miner
      );
      await this.mapping.addMinerSnapshot({
        minerName: minerSnapshot.miner_id,
        rawPower: minerSnapshot.raw_byte_power || 0,
        power: minerSnapshot.quality_adj_power || 0,
        balance: minerSnapshot.balance || 0,
        pledge: minerSnapshot.initial_pledge || 0,
        lockFunds: minerSnapshot.locked_funds || 0,
        dateAt: new Date(),
      });
    }
    return true;
  }
}
