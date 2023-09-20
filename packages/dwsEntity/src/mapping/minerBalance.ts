import { Provide } from '@midwayjs/decorator';

import { MinerBalanceEntity } from '@dws/entity';
import { Optional, UpsertOptions } from 'sequelize';

@Provide()
export class MinerBalanceMapping {
  getModel() {
    return MinerBalanceEntity;
  }

  async upsertMinerBalance(
    values: Optional<any, string>,
    options?: UpsertOptions<any>
  ) {
    return this.getModel().upsert(values, options);
  }
}
