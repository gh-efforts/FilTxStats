import { Provide } from '@midwayjs/core';

import { MinerSectorEntity } from '@dws/entity';

import { BulkCreateOptions, Optional } from 'sequelize';

@Provide()
export class MinerSectorMapping {
  getModel() {
    return MinerSectorEntity;
  }

  async bulkCreateMinerSector(
    values: Optional<any, string>[],
    options?: BulkCreateOptions
  ) {
    return this.getModel().bulkCreate(values, options);
  }
}
