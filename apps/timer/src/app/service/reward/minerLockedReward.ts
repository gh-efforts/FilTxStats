import { MinerLockedRewardEntity, MinerLockedRewardMapping } from '@dws/entity';
import { Inject, Provide } from '@midwayjs/core';
import * as dayjs from 'dayjs';
import * as _ from 'lodash';
import { Op, Transaction } from 'sequelize';
import { BaseService } from '../../../core/baseService';
import { MINER_RELEASE_TYPE } from '../../constant/miner';
import { MinerRewardOptions } from '../../model/dto/minerLockedReward';
@Provide()
export class MinerLockedRewardService extends BaseService<MinerLockedRewardEntity> {
  @Inject()
  mapping: MinerLockedRewardMapping;

  public async addLockedReward(rewards: MinerRewardOptions[], t: Transaction) {
    const newRewards = _.cloneDeep(rewards);
    return this.mapping.bulkCreateMinerLockedReward(
      newRewards.map(reward => {
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

  public async getLockedRewardByRelease(hour: number) {
    const list = await this.mapping.findAllMinerLockedReward({
      attributes: ['miner', 'cid', 'dailyReward', 'time'],
      where: {
        hour,
        isComplete: false,
        time: {
          [Op.lte]: new Date(),
        },
      },
    });

    const today = dayjs().format('YYYY-MM-DD');

    return list.map(item => {
      const { miner, cid, dailyReward, time } = item;
      const releaseTime = `${today} ${time.split(' ')[1]}`;
      return {
        miner,
        cid,
        releaseFil: dailyReward,
        type: MINER_RELEASE_TYPE.PERCENT_75,
        dateAt: today,
        timestamp: dayjs(releaseTime).unix(),
      };
    });
  }

  public async completeRecord(height: number) {
    return this.mapping.updateMinerLockedReward(
      {
        isComplete: true,
      },
      {
        where: {
          height: {
            // 518400为180天的高度数
            [Op.lt]: height - 518400,
          },
        },
      }
    );
  }
}
