import { Provide } from '@midwayjs/core';

import { MinerTypeEntity } from '@dws/entity';

@Provide()
export class MinerTypeMapping {
  getModel() {
    return MinerTypeEntity;
  }

  async saveNew(params: any) {
    return this.getModel().create(params);
  }
}
