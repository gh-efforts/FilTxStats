import {
  MinerBalanceEntity,
  MinerBalanceMapping,
  MinerMapping,
  MinerNodeMapping,
} from '@dws/entity';
import { LilyMapping } from '@lily/entity';
import { LotusSdk } from '@lotus/http';
import * as bull from '@midwayjs/bull';
import { Config, Init, Inject, Provide } from '@midwayjs/core';
import * as _ from 'lodash';
import * as pLimit from 'p-limit';
import { BaseService } from '../../core/baseService';

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
  lilyMapping: LilyMapping;

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
    const miners = await this.getMinerIds();
    const minerNode = await this.getMinerNode(miners);
    const group = _.groupBy(minerNode, 'minerName');
    const limit = pLimit(5);
    for (const miner in group) {
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

      const result = await Promise.all(
        nodes.map(node => {
          return limit(() =>
            this.lilyMapping.getMinerBalance(node.name).then(async res => {
              let balance: string;
              if (!res) {
                //lily没查到，有可能矿工数据比较老旧;
                let chainRet = await this.lotus.stateGetActor(node.name);
                balance = chainRet.Balance;
              } else {
                balance = (res?.balance || 0).toString();
              }
              return {
                miner: node.name,
                type: node.type,
                balance,
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
      await this.mapping.upsertMinerBalance(object, {
        fields: ['balance', 'owner', 'worker', 'controller', 'beneficiary'],
      });
    }
  }
}
