import { Inject, Provide } from '@midwayjs/core';
import { BaseService } from '../../../core/baseService';

import { MinerRewardEntity, MinerRewardMapping } from '@dws/entity';
import { Transaction } from 'sequelize';
import { MinerRewardOptions } from '../../model/dto/minerLockedReward';
@Provide()
export class MinerRewardService extends BaseService<MinerRewardEntity> {
  @Inject()
  mapping: MinerRewardMapping;

  async addMinerReward(minerReward: MinerRewardOptions[], t: Transaction) {
    console.log('=====', minerReward);
    return this.mapping.bulkCreateMinerReward(minerReward, {
      transaction: t,
    });
  }
}
