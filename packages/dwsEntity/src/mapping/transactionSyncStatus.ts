import { Provide } from '@midwayjs/core';

import { TransactionSyncStatusEntity } from '@dws/entity';
import {
  BulkCreateOptions,
  FindOptions,
  Optional,
  UpdateOptions,
} from 'sequelize';

@Provide()
export class TransactionSyncStatusMapping {
  getModel() {
    return TransactionSyncStatusEntity;
  }

  async bulkCreateTransactionSyncStatus(
    values: Optional<any, string>[],
    options?: BulkCreateOptions
  ) {
    return this.getModel().bulkCreate(values, options);
  }

  async creadteTransactionSyncStatus(
    values: Optional<any, string>,
    options?: BulkCreateOptions
  ) {
    return this.getModel().create(values, options);
  }

  public async modifyTransactionSyncStatus(
    values: { [x: string]: any },
    options: UpdateOptions
  ) {
    return this.getModel().update(values, options);
  }

  public async findOneTransactionSyncStatus(options?: FindOptions) {
    return this.getModel().findOne(options);
  }

  public async findAllTransactionSyncStatus(options?: FindOptions) {
    return this.getModel().findAll(options);
  }
}
