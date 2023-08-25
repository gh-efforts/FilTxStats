import {
  MinerReleaseRecordEntity,
  MinerReleaseRecordMapping,
} from '@dws/entity';

import * as dayjs from 'dayjs';
import { bigDiv, bigMul } from 'happy-node-utils';
import { MINER_RELEASE_TYPE } from '../../constant/miner';

import { Inject, Provide } from '@midwayjs/core';
import { Transaction } from 'sequelize';
import { BaseService } from '../../../core/baseService';
import { MinerRewardOptions } from '../../model/dto/minerLockedReward';
@Provide()
export class MinerReleaseRecordService extends BaseService<MinerReleaseRecordEntity> {
  @Inject()
  mapping: MinerReleaseRecordMapping;

  // 立即释放-filfox
  public async releasePercent25(
    minersReward: MinerRewardOptions[],
    t: Transaction
  ) {
    const data = minersReward.map(item => {
      const { miner, cid, reward, time } = item;
      const releaseFil = bigMul(reward, 0.25).toString();
      const dateAt = dayjs(time).format('YYYY-MM-DD');
      return {
        miner,
        cid,
        releaseFil,
        type: MINER_RELEASE_TYPE.PERCENT_25,
        dateAt,
        timestamp: dayjs(time).unix(),
      };
    });
    return this.mapping.bulkCreateMinerReleaseRecord(data, {
      transaction: t,
      updateOnDuplicate: ['releaseFil', 'updatedAt'],
    });
  }

  // 释放历史冻结奖励
  public async releaseHisLockedReward(
    minersReward: MinerRewardOptions[],
    t: Transaction
  ) {
    const data: Partial<MinerReleaseRecordEntity>[] = [];
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

    for (const item of minersReward) {
      let { miner, cid, reward, time } = item;
      const lockedReward = bigMul(reward, 0.75).toString();
      const releaseFil = bigDiv(lockedReward, 180).toString();
      let dateAt = dayjs(time).add(1, 'day').format('YYYY-MM-DD'); // 开始释放日期
      let timeAt = dayjs(time).add(1, 'day').format('YYYY-MM-DD HH:mm:ss'); // 第一次释放时间
      let count = 0;
      while (timeAt <= now && count < 180) {
        data.push({
          miner,
          cid,
          releaseFil,
          type: MINER_RELEASE_TYPE.PERCENT_75,
          dateAt,
          timestamp: dayjs(timeAt).unix(),
        });
        ++count;
        timeAt = dayjs(timeAt).add(1, 'day').format('YYYY-MM-DD HH:mm:ss'); // 下一次释放日期
        dateAt = dayjs(dateAt).add(1, 'day').format('YYYY-MM-DD'); // 下一次释放时间
      }
    }

    return this.mapping.bulkCreateMinerReleaseRecord(data, {
      transaction: t,
      updateOnDuplicate: ['releaseFil', 'updatedAt'],
    });
  }
}
