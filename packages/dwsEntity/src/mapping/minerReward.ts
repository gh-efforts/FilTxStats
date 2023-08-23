import { Provide } from '@midwayjs/core';

import { MinerRewardEntity } from '@dws/entity';
import { BulkCreateOptions, Optional } from 'sequelize';

@Provide()
export class MinerRewardMapping {
  getModel() {
    return MinerRewardEntity;
  }

  async addMinerReward(params: Optional<any, string>) {
    return this.getModel().create(params);
  }

  async bulkCreateMinerReward(values: any[], options?: BulkCreateOptions) {
    return this.getModel().bulkCreate(values, options);
  }
}
