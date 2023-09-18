import { Provide } from '@midwayjs/core';

import { VmMessagesEntity } from '@dws/entity';
import {
  AggregateOptions,
  BulkCreateOptions,
  FindOptions,
  Optional,
} from 'sequelize';
@Provide()
export class VmMessagesMapping {
  getModel() {
    return VmMessagesEntity;
  }

  public async findAllVmMessages(options?: FindOptions) {
    return this.getModel().findAll(options);
  }
  public async findOneVmMessages(options?: FindOptions) {
    return this.getModel().findOne(options);
  }

  public async getMaxHeight(options?: AggregateOptions<number>) {
    return this.getModel().max('height', options);
  }

  async bulkCreateVmMessages(
    values: Optional<any, string>[],
    options?: BulkCreateOptions
  ) {
    return this.getModel().bulkCreate(values, options);
  }
}
