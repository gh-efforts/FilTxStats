import { Provide } from '@midwayjs/core';

import { DerivedGasOutputsEntity } from '@lily/entity';
import { AggregateOptions, Op } from 'sequelize';
@Provide()
export class LilyDerivedGasOutputsMapping {
  getModel() {
    return DerivedGasOutputsEntity;
  }

  async getTransactions(
    address: string | string[],
    startHeight: number,
    endHeight: number,
    key: 'from' | 'to'
  ) {
    const res = await this.getModel().findAll({
      where: {
        height: {
          [Op.between]: [startHeight, endHeight],
        },
        [key]: address,
      },
      order: ['height'],
      raw: true,
    });

    return res;
  }

  public async getMinHeight(
    options?: AggregateOptions<DerivedGasOutputsEntity>
  ) {
    const res = await this.getModel().min('height', options);
    return Number(res) || 0;
  }
}
