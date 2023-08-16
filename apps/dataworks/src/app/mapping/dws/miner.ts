import { Provide } from '@midwayjs/core';

import { MinerEntity } from '@dws/entity';
import { Optional } from 'sequelize';
import { BaseMapping } from './../../../core/baseMapping';

@Provide()
export class MinerMapping extends BaseMapping<MinerEntity> {
  getModel() {
    return MinerEntity;
  }

  async addMiner(params: Optional<any, string>) {
    return this.getModel().create(params);
  }
}
