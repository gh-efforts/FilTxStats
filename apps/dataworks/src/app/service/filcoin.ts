import {
  FilcoinNetworkDataEntity,
  FilcoinNetworkDataMapping,
} from '@dws/entity';

import * as _ from 'lodash';

import { FilfoxSdk } from '@filfox/http';
import { FilscanSdk } from '@filscan/http';
import { Config, Init, Inject, Provide } from '@midwayjs/core';
import { BaseService } from '../../core/baseService';
import { FILCACHEKEY } from '../comm/filcoin';
import RedisUtils from '../comm/redis';

@Provide()
export class FilcoinNetworkService extends BaseService<FilcoinNetworkDataEntity> {
  @Inject()
  mapping: FilcoinNetworkDataMapping;

  @Inject()
  redisUtils: RedisUtils;

  @Config('filscanConfig.url')
  filscanUrl: string;

  @Config('filfoxConfig.url')
  filfoxUrl: string;

  private filscan: FilscanSdk;

  private filfox: FilfoxSdk;

  @Init()
  async initMethod() {
    this.filscan = new FilscanSdk(this.filscanUrl);
    this.filfox = new FilfoxSdk(this.filfoxUrl);
  }

  async getNetworkData() {
    try {
      const data = await this.filscan.getFilcoinNetworkData();
      const camelCase = {};
      Object.keys(data).forEach(key => {
        camelCase[_.camelCase(key)] = data[key];
      });
      return camelCase;
    } catch (error) {
      this.ctx.logger.error('network error', error);
      return this.mapping.getFilNetwork({
        order: [['createdAt', 'desc']],
      });
    }
  }

  async getMinerInfo(minerId: string) {
    const key = FILCACHEKEY.MINERINFO + minerId;
    const cache = await this.redisUtils.getString(key);
    if (cache) {
      return JSON.parse(cache);
    }
    const result = await this.filfox.getMinerDetail(minerId);

    const data = {
      // 账户余额
      balance: result.balance,
      // 节点长地址
      robust: result.robust,
      // 扇区大小
      sectorSize: result.miner.sectorSize,
      // 可用余额
      availableBalance: result.miner.availableBalance,
      // 扇区质押
      sectorPledgeBalance: result.miner.sectorPledgeBalance,
      // 锁仓奖励
      vestingFunds: result.miner.vestingFunds,
      // 预存款
      preCommitDeposits: result.miner.preCommitDeposits,
      // 有效算力
      qualityAdjPower: result.miner.qualityAdjPower,
      //原值算力
      rawBytePower: result.miner.rawBytePower,
      // 账户类型
      actor: result.actor === 'storageminer' ? 'miner' : 'account',
      owner: result.miner.owner.address,
      worker: result.miner.worker.address,
      beneficiary: result.miner.beneficiary.address,
      controlAddresses: result.miner.controlAddresses.map(c => c.address),
    };

    await this.redisUtils.setValue(key, JSON.stringify(data), 60);
    return data;
  }
}
