import { Provide } from '@midwayjs/core';

import { MinerRewardEntity } from '@dws/entity';
import { Optional } from 'sequelize';

@Provide()
export class MinerRewardMapping {
  getModel() {
    return MinerRewardEntity;
  }

  async addMinerReward(params: Optional<any, string>) {
    return this.getModel().create(params);
  }

  async bulkCreateMinerReward(values: Optional<any, string>[]) {
    return this.getModel().bulkCreate(values);
  }
}
