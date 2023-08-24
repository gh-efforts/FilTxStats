import { Provide } from '@midwayjs/core';

import { MinerDailyStatsEntity } from '@dws/entity';
import { BulkCreateOptions, Optional } from 'sequelize';

@Provide()
export class MinerDailyStatsMapping {
  getModel() {
    return MinerDailyStatsEntity;
  }

  async addMinerDailyStats(params: Optional<any, string>) {
    return this.getModel().create(params);
  }

  async bulkCreateMinerDailyStats(
    values: Optional<any, string>[],
    options?: BulkCreateOptions
  ) {
    return this.getModel().bulkCreate(values, options);
  }
}
