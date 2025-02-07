import { Provide, Scope, ScopeEnum } from '@midwayjs/core';

import { MinerEntity } from '@dws/entity';
import { FindOptions, Optional, UpsertOptions, WhereOptions } from 'sequelize';

@Provide()
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export class MinerMapping {
  getModel() {
    return MinerEntity;
  }

  async addMiner(params: Optional<any, string>) {
    return this.getModel().create(params);
  }

  async upsertMiner(values: { [x: string]: any }, options?: UpsertOptions) {
    return this.getModel().upsert(values, options);
  }

  async getMinerList(where?: WhereOptions<MinerEntity>) {
    return this.getModel().findAll({
      where,
    });
  }

  async findAllMiner(options?: FindOptions) {
    return this.getModel().findAll(options);
  }

  async modifyMiner(values: { [x: string]: any }, options?: any) {
    return this.getModel().update(values, options);
  }
}
