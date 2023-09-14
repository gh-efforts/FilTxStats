import { Provide } from '@midwayjs/core';

import { MinerSectorExpiredEntity } from '@dws/entity';

import { BulkCreateOptions, Optional } from 'sequelize';

@Provide()
export class MinerSectorExpiredMapping {
  getModel() {
    return MinerSectorExpiredEntity;
  }

  async bulkCreateMinerSectorExpired(
    values: Optional<any, string>[],
    options?: BulkCreateOptions
  ) {
    return this.getModel().bulkCreate(values, options);
  }
}
