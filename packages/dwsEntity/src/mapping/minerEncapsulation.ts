import { Provide } from '@midwayjs/core';

import { MinerEncapsulationEntity } from '@dws/entity';
import { BulkCreateOptions, Optional, UpsertOptions } from 'sequelize';

@Provide()
export class MinerEncapsulationMapping {
  getModel() {
    return MinerEncapsulationEntity;
  }

  async bulkCreateMinerEncapsulation(
    values: Optional<any, string>[],
    options?: BulkCreateOptions
  ) {
    return this.getModel().bulkCreate(values, options);
  }

  async upsertEncapsulation(
    values: Optional<any, string>,
    options?: UpsertOptions<any>
  ) {
    return this.getModel().upsert(values, options);
  }
}
