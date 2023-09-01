import { Provide } from '@midwayjs/core';

import { FilcoinNetworkDataEntity } from '@dws/entity';
import { CreateOptions, FindOptions, Optional } from 'sequelize';

@Provide()
export class FilcoinNetworkDataMapping {
  getModel() {
    return FilcoinNetworkDataEntity;
  }

  async addFilNetwork(
    value: Optional<any, string>,
    options?: CreateOptions<FilcoinNetworkDataEntity>
  ) {
    return this.getModel().create(value, options);
  }

  async getFilNetwork(options?: FindOptions<FilcoinNetworkDataEntity>) {
    return this.getModel().findOne(options);
  }
}
