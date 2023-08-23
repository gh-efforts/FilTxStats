import { Provide } from '@midwayjs/core';

import { MinerReleaseRecordEntity } from '@dws/entity';
import { BulkCreateOptions, Optional } from 'sequelize';

@Provide()
export class MinerReleaseRecordMapping {
  getModel() {
    return MinerReleaseRecordEntity;
  }

  async addMinerReleaseRecord(params: Optional<any, string>) {
    return this.getModel().create(params);
  }

  async bulkCreateMinerReleaseRecord(
    values: any[],
    options?: BulkCreateOptions
  ) {
    return this.getModel().bulkCreate(values, options);
  }
}
