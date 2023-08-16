import { Provide } from '@midwayjs/core';

import { MinerSnapshotEntity } from '@dws/entity';
import { Optional } from 'sequelize';
import { BaseMapping } from './../../../core/baseMapping';

@Provide()
export class MinerSnapshotMapping extends BaseMapping<MinerSnapshotEntity> {
  getModel() {
    return MinerSnapshotEntity;
  }

  async addMinerSnapshot(params: Optional<any, string>) {
    return this.getModel().create(params);
  }
}
