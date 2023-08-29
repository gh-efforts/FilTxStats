import { Provide } from '@midwayjs/core';

import { MinerLockedRewardEntity } from '@dws/entity';
import { BulkCreateOptions, FindOptions, Optional } from 'sequelize';

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

  async findAllMinerLockedReward(options?: FindOptions) {
    return this.getModel().findAll(options);
  }

  async updateMinerLockedReward(values: { [x: string]: any }, options?: any) {
    return this.getModel().update(values, options);
  }
}
