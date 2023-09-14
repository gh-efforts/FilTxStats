import { Config, Init, Inject, Provide } from '@midwayjs/core';

import {
  MinerMapping,
  MinerSectorExpiredEntity,
  MinerSectorExpiredMapping,
} from '@dws/entity';
import { PixiuSdk } from '@pixiu/http';
import { BaseService } from '../../core/baseService';

@Provide()
export class MinerSectorExpiredService extends BaseService<MinerSectorExpiredEntity> {
  @Inject()
  mapping: MinerSectorExpiredMapping;

  @Inject()
  minerMapping: MinerMapping;

  @Config('pixiuConfig.url')
  pixiuUrl;

  pixiu: PixiuSdk;

  @Init()
  async initMethod() {
    this.pixiu = new PixiuSdk(this.pixiuUrl);
  }

  async syncMinerSectorExpired() {
    const miners = (await this.minerMapping.getMinerList()).map(
      item => item.miner
    );
    const result = await this.pixiu.getSectorStatsPledge(miners);
    const data = [];

    result?.forEach(item => {
      item.stats?.forEach(s => {
        data.push({
          miner: item.minerid,
          power: s.powerExpired,
          sectorCount: s.num,
          initialPledge: s.initialPledge,
          dateAt: s.date,
        });
      });
    });

    await this.mapping.bulkCreateMinerSectorExpired(data, {
      updateOnDuplicate: ['power', 'sectorCount', 'initialPledge', 'updatedAt'],
    });
  }
}
