import { Provide } from '@midwayjs/core';

import { MinerSnapshotEntity } from '@dws/entity';
import { Optional } from 'sequelize';

@Provide()
export class MinerSnapshotMapping {
  getModel() {
    return MinerSnapshotEntity;
  }

  async addMinerSnapshot(params: Optional<any, string>) {
    return this.getModel().create(params);
  }
}
