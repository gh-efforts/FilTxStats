import { Provide } from '@midwayjs/core';

import { MinerEncapsulationEntity } from '@dws/entity';
import { Optional, UpsertOptions } from 'sequelize';

@Provide()
export class MinerEncapsulationMapping {
  getModel() {
    return MinerEncapsulationEntity;
  }

  async upsertEncapsulation(
    values: Optional<any, string>,
    options?: UpsertOptions<any>
  ) {
    return this.getModel().upsert(values, options);
  }
}
