import { Provide } from '@midwayjs/core';

import { GasDetailEntity } from '@dws/entity';
import { BulkCreateOptions, Optional } from 'sequelize';

@Provide()
export class GasDetailMapping {
  getModel() {
    return GasDetailEntity;
  }

  async bulkCreate(values: Optional<any, any>[], options?: BulkCreateOptions) {
    return this.getModel().bulkCreate(values, options);
  }
}
