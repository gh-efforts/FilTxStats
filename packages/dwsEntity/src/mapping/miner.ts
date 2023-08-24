import { Provide } from '@midwayjs/core';

import { MinerEntity } from '@dws/entity';
import { Optional, UpdateOptions, WhereOptions } from 'sequelize';

@Provide()
export class MinerMapping {
  getModel() {
    return MinerEntity;
  }

  async addMiner(params: Optional<any, string>) {
    return this.getModel().create(params);
  }

  async getMinerList(where?: WhereOptions<MinerEntity>) {
    return this.getModel().findAll({
      where,
    });
  }

  async modifyMiner(values: { [x: string]: any }, options?: UpdateOptions) {
    return this.getModel().update(values, options);
  }
}
