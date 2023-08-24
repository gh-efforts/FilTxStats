import { Inject, Provide } from '@midwayjs/core';

import { MinerEntity, MinerMapping } from '@dws/entity';
import { BaseService } from '../../core/baseService';

@Provide()
export class MinerService extends BaseService<MinerEntity> {
  @Inject()
  mapping: MinerMapping;

  async modifyMiner(values: { [x: string]: any }, where?: any) {
    return this.mapping.modifyMiner(values, {
      where,
    });
  }

  async getMinerList() {
    return this.mapping.getMinerList({
      isSyncRewardHistory: true,
    });
  }
}
