import {
  DerivedGasOutputsMapping,
  MinerEncapsulationEntity,
  MinerEncapsulationMapping,
  MinerMapping,
  MinerNodeMapping,
  VmMessagesMapping,
  WalletMapping,
} from '@dws/entity';
import { FilutilsSdk } from '@filutils/http';
import {
  LilyDerivedGasOutputsMapping,
  LilyMapping,
  LilyVmMessagesMapping,
} from '@lily/entity';
import { LotusSdk } from '@lotus/http';
import { Config, Init, Inject, Provide } from '@midwayjs/core';
import * as dayjs from 'dayjs';
import { Op } from 'sequelize';
import { BaseService } from '../../core/baseService';

import { getHeightByTime } from '@dws/utils';
import { InjectDataSource } from '@midwayjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { SyncBaseDTO } from '../model/dto/transaction';

@Provide()
export class TransactionService extends BaseService<MinerEncapsulationEntity> {
  @Inject()
  mapping: MinerEncapsulationMapping;

  @Inject()
  minerMapping: MinerMapping;

  @Inject()
  minerNodeMapping: MinerNodeMapping;

  @Inject()
  walletMapping: WalletMapping;

  @Inject()
  derivedGasOutputsMapping: DerivedGasOutputsMapping;

  @Inject()
  lilyDerivedGasOutputsMapping: LilyDerivedGasOutputsMapping;

  @Inject()
  lilyMapping: LilyMapping;

  @Inject()
  vmMessagesMapping: VmMessagesMapping;

  @Inject()
  lilyVmMessagesMapping: LilyVmMessagesMapping;

  @InjectDataSource()
  defaultDataSource: Sequelize;

  @Config('filutilsConfig.url')
  filutilsUrl: string;

  @Config('lotusConfig')
  lotusConfig: {
    url: string;
    token: string;
  };

  filutils: FilutilsSdk;

  lotus: LotusSdk;

  updateOnDuplicateKey: [
    'from',
    'to',
    'value',
    'gasFeeCap',
    'gasPremium',
    'gasLimit',
    'sizeBytes',
    'nonce',
    'method',
    'exitCode',
    'gasUsed',
    'parentBaseFee',
    'baseFeeBurn',
    'overEstimationBurn',
    'minerPenalty',
    'minerTip',
    'refund',
    'gasRefund',
    'gasBurned',
    'actorName',
    'actorFamily'
  ];

  @Init()
  async initMethod() {
    this.filutils = new FilutilsSdk(this.filutilsUrl);
    this.lotus = new LotusSdk(this.lotusConfig.url, this.lotusConfig.token);
  }

  async getMinerAddress() {
    return this.minerMapping
      .findAllMiner({
        attributes: ['miner', 'address'],
        raw: true,
      })
      .then(miners => {
        return [].concat(
          ...miners.map(({ miner, address }) => [miner, address])
        );
      });
  }

  async getMinerNodeAddress() {
    return this.minerNodeMapping
      .findAllMinerNode({
        attributes: ['minerName', 'robustAddress'],
        raw: true,
      })
      .then(nodes => {
        return [].concat(
          ...nodes.map(({ minerName, robustAddress }) => [
            minerName,
            robustAddress,
          ])
        );
      });
  }

  async getWalletAddress() {
    return this.walletMapping
      .findAllWallet({
        where: {
          name: {
            [Op.ne]: 'f0',
          },
        },
        attributes: ['name', 'robustAddress'],
        raw: true,
      })
      .then(wallets => {
        return [].concat(
          ...wallets.map(({ name, robustAddress }) => [name, robustAddress])
        );
      });
  }

  public async syncTransaction(params: SyncBaseDTO) {
    let { names } = params;
    // 获取起始高度
    // 获取miner、minerNode、wallet表所有地址
    let addresses = names; // 默认为指定地址
    if (names.length === 0) {
      const res = await Promise.all([
        this.getMinerAddress(),
        this.getMinerNodeAddress(),
        this.getWalletAddress(),
      ]);
      addresses = [].concat(...res.map(item => item));
    }
    const EACH_GROUP_LENGTH = 100; // 每个数组内的数量

    // 将查询数据分为几组查询
    const addressesGroup = this.utils.splitArray<string>(
      addresses,
      Math.ceil(addresses.length / EACH_GROUP_LENGTH)
    );

    let startDerivedGasHeight =
      await this.derivedGasOutputsMapping.getMaxHeight();

    if (startDerivedGasHeight === 0) {
      startDerivedGasHeight =
        await this.lilyDerivedGasOutputsMapping.getMinHeight();
    }

    let startVmMessagesHeight = await this.vmMessagesMapping.getMaxHeight();

    if (startVmMessagesHeight === 0) {
      startVmMessagesHeight = await this.lilyVmMessagesMapping.getMinHeight();
    }

    // 以当前时间，推算出当前高度
    const nowHeight = getHeightByTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));

    const endHeight = nowHeight - 120;

    for (const item of addressesGroup) {
      console.log('startDerivedGasHeight', startDerivedGasHeight);
      console.log('startVmMessagesHeight', startVmMessagesHeight);
      console.log('endHeight', endHeight);
      if (item.length > 0) {
        await Promise.all([
          this._getDerivedGasTransactionsAndSave(
            item,
            startDerivedGasHeight,
            endHeight
          ),
          this._getVmMessagesTransactionsAndSave(
            item,
            startVmMessagesHeight,
            endHeight
          ),
        ]);
      }
    }
    return true;
  }

  private async _getDerivedGasTransactionsAndSave(
    item: string[],
    startHeight: number,
    endHeight: number
  ) {
    const len = Math.floor((endHeight - startHeight) / 500);
    for (let i = 0; i < len; i++) {
      const t = await this.defaultDataSource.transaction();
      const height = i === len - 1 ? endHeight : startHeight + 500;
      // 从lily表查询大于指定高度的数据
      try {
        const [fromTransactions, toTransactions] = await Promise.all([
          this.lilyVmMessagesMapping.getTransactions(
            item,
            startHeight,
            height,
            'from'
          ) as any,
          this.lilyVmMessagesMapping.getTransactions(
            item,
            startHeight,
            height,
            'to'
          ) as any,
        ]);
        await this.derivedGasOutputsMapping.bulkCreateDerivedGasOutputs(
          fromTransactions,
          {
            updateOnDuplicate: this.updateOnDuplicateKey,
            transaction: t,
            ignoreDuplicates: true,
          }
        );

        await this.derivedGasOutputsMapping.bulkCreateDerivedGasOutputs(
          toTransactions,
          {
            updateOnDuplicate: this.updateOnDuplicateKey,
            transaction: t,
            ignoreDuplicates: true,
          }
        );
        await t.commit();
        // 500 区块跑一次
        startHeight += 500;
      } catch (error) {
        console.log('object error', error);
        await t.rollback();
        throw new Error(
          `定时任务报错（同步交易数据）：高度：${startHeight} -> ${endHeight} 地址数组：${item}
        ${error}`
        );
      }
    }

    return true;
  }

  private async _getVmMessagesTransactionsAndSave(
    item: string[],
    startHeight: number,
    endHeight: number
  ) {
    const len = Math.floor((endHeight - startHeight) / 500);
    for (let i = 0; i < len; i++) {
      const t = await this.defaultDataSource.transaction();
      const height = i === len - 1 ? endHeight : startHeight + 500;
      // 从lily表查询大于指定高度的数据
      try {
        const [fromTransactions, toTransactions] = await Promise.all([
          this.lilyVmMessagesMapping.getTransactions(
            item,
            startHeight,
            height,
            'from'
          ) as any,
          this.lilyVmMessagesMapping.getTransactions(
            item,
            startHeight,
            height,
            'to'
          ) as any,
        ]);
        await this.vmMessagesMapping.bulkCreateVmMessages(fromTransactions, {
          updateOnDuplicate: this.updateOnDuplicateKey,
          transaction: t,
          ignoreDuplicates: true,
        });

        await this.vmMessagesMapping.bulkCreateVmMessages(toTransactions, {
          updateOnDuplicate: this.updateOnDuplicateKey,
          transaction: t,
          ignoreDuplicates: true,
        });
        await t.commit();
        // 500 区块跑一次
        startHeight += 500;
      } catch (error) {
        console.log('object error', error);
        await t.rollback();
        throw new Error(
          `定时任务报错（同步交易数据）：高度：${startHeight} -> ${endHeight} 地址数组：${item}
        ${error}`
        );
      }
    }

    return true;
  }
}
