import { Provide } from '@midwayjs/core';

import { MinerLockedRewardEntity } from '@dws/entity';
import { BulkCreateOptions, Optional } from 'sequelize';

@Provide()
export class MinerLockedRewardMapping {
  getModel() {
    return MinerLockedRewardEntity;
  }

  async addMinerLockedReward(params: Optional<any, string>) {
    return this.getModel().create(params);
  }

  async bulkCreateMinerLockedReward(
    values: any[],
    options?: BulkCreateOptions
  ) {
    return this.getModel().bulkCreate(values, options);
  }
}
