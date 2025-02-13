import {
  MinerBalanceEntity,
  MinerBalanceMapping,
  MinerMapping,
  MinerNodeMapping,
} from '@dws/entity';
import * as lilymessages from '@lilymessages/entity';

import { LotusSdk } from '@lotus/http';
import * as bull from '@midwayjs/bull';
import { Config, ILogger, Init, Inject, Logger, Provide } from '@midwayjs/core';
import * as _ from 'lodash';
import * as pLimit from 'p-limit';
import { BaseService } from '../../core/baseService';
import { LilyMapping } from '@lilymessages/entity';
import dayjs = require('dayjs');
import { getHeightByTime, getTimeByHeight } from '@dws/utils';
// import { LilyMapping } from '@lily/entity';

Array.prototype.get = function <T>(key: string, value: any): T | undefined {
  return this.find(item => {
    if (!item) {
      return false;
    }
    return item[key] === value;
  });
};

@Provide()
export class MinerBalanceService extends BaseService<MinerBalanceEntity> {
  @Inject()
  bullFramework: bull.Framework;

  @Inject()
  mapping: MinerBalanceMapping;

  @Inject()
  minerMapping: MinerMapping;

  @Inject()
  minerNodeMapping: MinerNodeMapping;

  @Config('lotusConfig')
  lotusConfig: {
    url: string;
    token: string;
  };

  lotus: LotusSdk;

  @Inject()
  lilyMapping: lilymessages.LilyMapping;

  @Logger()
  logger: ILogger;

  @Init()
  async initMethod() {
    this.lotus = new LotusSdk(this.lotusConfig.url, this.lotusConfig.token);
  }

  async getMinerIds() {
    return this.minerMapping.getMinerList().then(res => {
      return res.map(item => item.miner);
    });
  }

  async getMinerNode(miners: string[]) {
    return this.minerNodeMapping.findAllMinerNode({
      where: {
        minerName: miners,
        status: 1,
      },
      raw: true,
    });
  }

  async syncMinerBalance() {
    // const miners = await this.getMinerIds();
    let miners = ['f03080854'];
    const minerNode = await this.getMinerNode(miners);
    const group = _.groupBy(minerNode, 'minerName');
    const limit = pLimit(5);
    for (const miner in group) {
      this.logger.info('syncMinerBalance step1 miner=%s', miner);
      const nodes = group[miner].map(item => {
        return {
          name: item.name,
          type: item.type,
          balance: 0,
        };
      });
      const minerInfo = await this.lotus.getStateMinerInfo(miner);
      nodes.push(
        {
          name: minerInfo.beneficiary,
          type: 4,
          balance: 0,
        },
        {
          name: miner,
          type: 0,
          balance: 0,
        }
      );
      // 获取当前时间的高度
      const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
      const nowHeight = getHeightByTime(now);
      let startHeight = nowHeight - 2 * 60 * 24 * 100; //最近 100 天内如果没有，就不更新了
      this.logger.info(
        'syncMinerBalance step2 miner=%s, nodes.length=%d, startHeight=%d, startTime=%s',
        miner,
        nodes.length,
        startHeight,
        getTimeByHeight(startHeight)
      );

      const result = await Promise.all(
        nodes.map(node => {
          return limit(() =>
            this.lilyMapping
              .getMinerBalance(node.name, startHeight)
              .then(async res => {
                if (!res) {
                  this.logger.info(
                    'syncMinerBalance step2_1 lilynotfound miner=%s,type=%s',
                    miner,
                    node.type
                  );
                  return {
                    miner: node.name,
                    type: node.type,
                    needUpdate: false, //lily 查不到说明最近两三个月没有余额变化，大概率是老节点，不更新了
                  };
                }
                let balance = (res?.balance || 0).toString();
                return {
                  miner: node.name,
                  type: node.type,
                  balance,
                  needUpdate: true,
                };
              })
          );
        })
      );
      const object = {
        miner,
        balance: result.get('type', 0)?.balance || 0,
        worker: result.get('type', 1)?.balance || 0,
        owner: result.get('type', 2)?.balance || 0,
        controller: JSON.stringify(result.filter(item => item.type === 3)),
        beneficiary: result.get('type', 4)?.balance || 0,
      };
      this.logger.info('syncMinerBalance step3 miner=%j', object);

      await this.mapping.upsertMinerBalance(object, {
        fields: ['balance', 'owner', 'worker', 'controller', 'beneficiary'],
      });
    }
  }
}
