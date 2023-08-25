import { Config, Init, Inject, Provide } from '@midwayjs/core';

import {
  MinerMapping,
  MinerSnapshotEntity,
  MinerSnapshotMapping,
} from '@dws/entity';
import { PixiuSdk } from '@pixiu/http';
import * as dayjs from 'dayjs';
import { BaseService } from '../../core/baseService';

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
    const miners = (await this.minerMapping.getMinerList()).map(
      item => item.miner
    );
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
        dateAt: dayjs().format('YYYY-MM-DD'),
      });
    }
    return true;
  }
}
