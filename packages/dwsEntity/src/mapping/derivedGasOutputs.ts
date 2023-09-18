import { Provide } from '@midwayjs/core';

import { DerivedGasOutputsEntity } from '@dws/entity';
import {
  AggregateOptions,
  BulkCreateOptions,
  FindOptions,
  Optional,
} from 'sequelize';

@Provide()
export class DerivedGasOutputsMapping {
  getModel() {
    return DerivedGasOutputsEntity;
  }

  public async findAllDerviedGasOutputs(options?: FindOptions) {
    return this.getModel().findAll(options);
  }
  public async findOneDerviedGasOutputs(options?: FindOptions) {
    return this.getModel().findOne(options);
  }

  public async getMaxHeight(options?: AggregateOptions<number>) {
    return this.getModel().max('height', options);
  }

  async bulkCreateDerivedGasOutputs(
    values: Optional<any, string>[],
    options?: BulkCreateOptions
  ) {
    return this.getModel().bulkCreate(values, options);
  }
}
