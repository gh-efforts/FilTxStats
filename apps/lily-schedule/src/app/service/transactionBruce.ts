import {
  DerivedGasOutputsMapping,
  MinerEncapsulationEntity,
  MinerEncapsulationMapping,
  MinerMapping,
  MinerNodeMapping,
  TransactionSyncStatusEntity,
  TransactionSyncStatusMapping,
  VmMessagesMapping,
  WalletMapping,
} from '@dws/entity';
import { FilutilsSdk } from '@filutils/http';
import {
  ActorsMapping,
  LilyDerivedGasOutputsMapping,
  LilyMapping,
  LilyVmMessagesMapping,
  MessagesMapping,
} from '@lily/entity';
import { LotusSdk } from '@lotus/http';
import { Config, Init, Inject, Provide, Logger } from '@midwayjs/core';
import * as dayjs from 'dayjs';
import { Op, col, fn } from 'sequelize';
import { BaseService } from '../../core/baseService';
import { ILogger } from '@midwayjs/logger';
import { getHeightByTime } from '@dws/utils';
import * as bull from '@midwayjs/bull';
import { v4 as uuidv4 } from 'uuid';
import _ = require('lodash');

@Provide()
export class TransactionBruceService extends BaseService<MinerEncapsulationEntity> {
  @Inject()
  mapping: MinerEncapsulationMapping;

  @Inject()
  minerMapping: MinerMapping;

  @Inject()
  lilyMapping: LilyMapping;

  @Inject()
  actorsMapping: ActorsMapping;

  @Inject()
  messagesMapping: MessagesMapping;

  @Inject()
  bullFramework: bull.Framework;

  @Config('filutilsConfig.url')
  filutilsUrl: string;

  @Config('lotusConfig')
  lotusConfig: {
    url: string;
    token: string;
  };

  @Logger()
  logger: ILogger;

  filutils: FilutilsSdk;

  lotus: LotusSdk;

  derivedUpdateOnDuplicateKey: ['height', 'cid', 'state_root'];
  vmUpdateOnDuplicateKey: ['height', 'state_root', 'cid', 'source'];

  @Init()
  async initMethod() {
    this.filutils = new FilutilsSdk(this.filutilsUrl);
    this.lotus = new LotusSdk(this.lotusConfig.url, this.lotusConfig.token);
  }

  /**
   * 分析交易
   * @returns
   */
  public async syncTransaction() {
    // 获取起始高度
    // 获取miner、minerNode、wallet表所有地址
    let addresses = [];
    const res = await Promise.all([
      this.getMinerAddress(),
      this.getMinerNodeAddress(),
      this.getWalletAddress(),
    ]);
    addresses = [].concat(...res.map(item => item));
    const EACH_GROUP_LENGTH = 100; // 每个数组内的数量

    // 将查询数据分为几组查询
    const addressesGroup = this.utils.splitArray<string>(
      addresses,
      Math.ceil(addresses.length / EACH_GROUP_LENGTH)
    );

    let startDerivedGasHeight =
      await this.derivedGasOutputsMapping.getMaxHeight();

    if (!startDerivedGasHeight) {
      startDerivedGasHeight =
        await this.lilyDerivedGasOutputsMapping.getMinHeight();
    }

    let startVmMessagesHeight = await this.vmMessagesMapping.getMaxHeight();

    if (!startVmMessagesHeight) {
      startVmMessagesHeight = await this.lilyVmMessagesMapping.getMinHeight();
    }

    // 以当前时间，推算出当前高度
    const nowHeight = getHeightByTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));

    const endHeight = nowHeight - 120;

    for (const item of addressesGroup) {
      const taskDerivedGas = {
        syncId: uuidv4(),
        type: 1,
        status: 0,
        startHeight: startDerivedGasHeight,
        endHeight: endHeight,
        runingHeight: startDerivedGasHeight,
        address: JSON.stringify(item),
      };

      const taskVm = {
        syncId: uuidv4(),
        type: 2,
        status: 0,
        startHeight: startVmMessagesHeight,
        endHeight: endHeight,
        runingHeight: startVmMessagesHeight,
        address: JSON.stringify(item),
      };

      const [derivceGas, vm] =
        await this.transactionSyncStatusMapping.bulkCreateTransactionSyncStatus(
          [taskDerivedGas, taskVm]
        );
      await this.runJob('transaction', derivceGas.toJSON());
      await this.runJob('transaction', vm.toJSON());
    }
    return true;
  }

  async syncLastTransaction(transactionTasks: TransactionSyncStatusEntity[]) {
    // 以当前时间，推算出当前高度
    const nowHeight = getHeightByTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
    // lily 数据库中数据有延迟,特地跑lily前两个小时的数据
    const endHeight = nowHeight - 120;

    const newTasks = transactionTasks.map(task => {
      return {
        syncId: task.syncId,
        type: task.type,
        status: 0,
        startHeight: task.endHeight,
        endHeight,
        runingHeight: task.endHeight,
        address: task.address,
      };
    });
    const result =
      await this.transactionSyncStatusMapping.bulkCreateTransactionSyncStatus(
        newTasks
      );

    for (let newTask of result) {
      await this.runJob('transaction', newTask.toJSON());
    }
    return true;
  }

  async runJob(queueName: string, param: any = {}) {
    // 获取 Processor 相关的队列
    const bullQueue = this.bullFramework.ensureQueue(queueName);
    // 立即执行这个任务
    await bullQueue.add(param);
    return true;
  }
}
