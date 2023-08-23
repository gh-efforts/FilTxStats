import { MinerLockedRewardEntity, MinerLockedRewardMapping } from '@dws/entity';
import { getTimeByHeight, transferFilValue } from '@dws/utils';
import { Inject, Provide } from '@midwayjs/core';
import * as dayjs from 'dayjs';
import { bigDiv, bigMul } from 'happy-node-utils';
import { Transaction } from 'sequelize';
import { BaseService } from '../../../core/baseService';
import { MinerRewardOptions } from '../../model/dto/minerLockedReward';

@Provide()
export class MinerLockedRewardService extends BaseService<MinerLockedRewardEntity> {
  @Inject()
  mapping: MinerLockedRewardMapping;

  public async addRecordByPixiu(minersReward) {
    const data = minersReward.map(item => {
      let { miner_id: miner, reward, cid, height } = item;
      const rewardTime = getTimeByHeight(height); // 区块奖励时间
      const releaseStartTime = dayjs(rewardTime) // 开始释放时间
        .add(1, 'day')
        .format('YYYY-MM-DD HH:mm:ss');
      const hour = dayjs(rewardTime).hour();
      const lockedReward = bigMul(reward, 0.75).toString();
      const dailyReward = bigDiv(lockedReward, 180).toString();
      return {
        miner,
        cid,
        lockedReward: transferFilValue(lockedReward),
        dailyReward: transferFilValue(dailyReward),
        time: releaseStartTime,
        height,
        hour,
      };
    });
    await this.mapping.bulkCreateMinerLockedReward(data);
  }

  public async addRecordByFilfox(minersReward) {
    const data = minersReward.map(item => {
      let { miner, cid, reward, time, height } = item;
      const hour = dayjs(time).hour();
      time = dayjs(time).add(1, 'day').format('YYYY-MM-DD HH:mm:ss');
      const lockedReward = bigMul(reward, 0.75).toString();
      const dailyReward = bigDiv(lockedReward, 180).toString();
      return {
        miner,
        cid,
        lockedReward,
        dailyReward,
        time,
        height,
        hour,
      };
    });
    await this.mapping.bulkCreateMinerLockedReward(data);
  }

  public async addLockedReward(rewards: MinerRewardOptions[], t: Transaction) {
    return this.mapping.bulkCreateMinerLockedReward(rewards, {
      transaction: t,
    });
  }
}
