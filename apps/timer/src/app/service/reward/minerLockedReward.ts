import { MinerLockedRewardEntity, MinerLockedRewardMapping } from '@dws/entity';
import { Inject, Provide } from '@midwayjs/core';
import * as dayjs from 'dayjs';
import { Transaction } from 'sequelize';
import { BaseService } from '../../../core/baseService';
import { MinerRewardOptions } from '../../model/dto/minerLockedReward';

@Provide()
export class MinerLockedRewardService extends BaseService<MinerLockedRewardEntity> {
  @Inject()
  mapping: MinerLockedRewardMapping;

  public async addLockedReward(rewards: MinerRewardOptions[], t: Transaction) {
    return this.mapping.bulkCreateMinerLockedReward(
      rewards.map(reward => {
        // 开始释放时间
        reward.time = dayjs(reward.time)
          .add(1, 'day')
          .format('YYYY-MM-DD HH:mm:ss');
        return reward;
      }),
      {
        transaction: t,
        updateOnDuplicate: ['lockedReward', 'dailyReward', 'updatedAt'],
      }
    );
  }
}
