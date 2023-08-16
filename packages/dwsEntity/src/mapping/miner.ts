import { Provide } from '@midwayjs/core';

import { MinerEntity } from '@dws/entity';
import { Optional } from 'sequelize';

@Provide()
export class MinerMapping {
  getModel() {
    return MinerEntity;
  }

  async addMiner(params: Optional<any, string>) {
    return this.getModel().create(params);
  }

  async getMinerList() {
    const miners = await this.getModel().findAll({
      attributes: ['miner'],
    });
    return miners.map(item => item.miner);
  }
}
