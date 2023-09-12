import {
  MinerEncapsulationEntity,
  MinerEncapsulationMapping,
  MinerMapping,
} from '@dws/entity';
import { getYesterdayTime } from '@dws/utils';
import { FilutilsSdk } from '@filutils/http';
import { LotusSdk } from '@lotus/http';
import { Config, Init, Inject, Provide } from '@midwayjs/core';
import BigNumber from 'bignumber.js';
import * as pLimit from 'p-limit';
import { BaseService } from '../../core/baseService';
import { MinerGas } from '../mapping/interface';
import { LilyMapping } from '../mapping/lily';

@Provide()
export class MinerService extends BaseService<MinerEncapsulationEntity> {
  @Inject()
  mapping: MinerMapping;

  @Inject()
  minerEncapsulationMapping: MinerEncapsulationMapping;

  @Inject()
  lilyMapping: LilyMapping;

  @Config('filutilsConfig.url')
  filutilsUrl: string;

  @Config('lotusConfig')
  lotusConfig: {
    url: string;
    token: string;
  };

  filutils: FilutilsSdk;
  lotus: LotusSdk;

  @Init()
  async initMethod() {
    this.filutils = new FilutilsSdk(this.filutilsUrl);
    this.lotus = new LotusSdk(this.lotusConfig.url, this.lotusConfig.token);
  }

  async getMinerIds() {
    return this.mapping.getMinerList().then(res => {
      return res.map(item => item.miner);
    });
  }
  /**
   *
   * 根据节点号查询类型
   * @param {string} miner - 节点号
   * @return {Promise<boolean>} - Returns a Promise that resolves to the minimum miner type.
   */
  async syncMinersByType(minerId: string[]) {
    let miners = minerId;
    if (minerId.length === 0) {
      miners = await this.getMinerIds();
    }

    const minerTypes = await Promise.all(
      miners.map(miner => this.lilyMapping.getLilyByMinerType(miner))
    );

    for (let minerType of minerTypes) {
      const { type, miner } = minerType;
      await this.mapping.modifyMiner(
        {
          type,
        },
        {
          where: {
            miner,
          },
        }
      );
    }

    return true;
  }
  // 同步 miner 质押
  async syncMinersByEncapsulation() {
    const miners = await this.getMinerIds();
    const { startAt, endAt } = await getYesterdayTime();

    const limit = pLimit(5);
    // 质押量
    const minersPledgeIncr = await Promise.all(
      miners.map(miner =>
        limit(() =>
          this.lilyMapping.getLilyMinerPledgeIncr(miner, startAt, endAt)
        )
      )
    );
    const gas = await Promise.all(
      miners.map(miner => {
        return limit(() => this.lilyMapping.getMinerGas(miner, startAt, endAt));
      })
    );
    // 封装 gas、windowsPost、惩罚 gas
    const getMinersGas = this._getEncapsulationGas(gas);
    // 丢块
    const minersLonelyblock = await Promise.all(
      miners.map(miner => {
        return limit(() =>
          this.filutils.getMinerLonelyblock(miner, startAt, endAt)
        );
      })
    );

    // 错误扇区数
    const minersFaultedSector = await Promise.all(
      miners.map(miner => {
        return limit(() =>
          this.lilyMapping.getFaultedSector(miner, startAt, endAt)
        );
      })
    );
    // 查询扇区大小
    const minersInfo = await Promise.all(
      miners.map(miner => {
        return limit(() => this.lilyMapping.getMinerInfo(miner));
      })
    );
    // 查询昨日算力
    const minersPower = await Promise.all(
      miners.map(miner => {
        return limit(() => this.lilyMapping.getMinerPower(miner, endAt));
      })
    );

    for (const miner of miners) {
      const minerPledgeIncr = minersPledgeIncr.find(
        item => item?.miner === miner
      );
      const minerGas = getMinersGas.find(item => item?.miner === miner);

      const minerLonelyblock = minersLonelyblock.find(
        item => item?.miner === miner
      );

      const minerFaultedSector = minersFaultedSector.find(
        item => item?.miner === miner
      );

      let minerInfo: any = minersInfo.find(item => item?.miner === miner);

      if (!minerInfo) {
        // 链上补充数据
        minerInfo = await this.lotus.getStateMinerInfo(miner);
      }

      const minerPower = minersPower.find(item => item?.miner === miner);

      const object = {
        miner,
        sectorSize: minerInfo?.sectorsize || 0,
        qualityAdjPower: minerPower?.qualityadjpower || 0,
        rawBytePower: minerPower?.rawbytepower || 0,
        increasePledge: minerPledgeIncr?.initiaPledge || 0,
        encapsulationGas: minerGas?.gas || 0,
        windowPost: minerGas?.windowPost || 0,
        penalty: minerGas?.penalty || 0,
        blockLoss: minerLonelyblock?.lonelyblock.length || 0,
        faultedSector: minerFaultedSector?.count || 0,
        dateAt: endAt,
      };

      await this.minerEncapsulationMapping.upsertEncapsulation(object, {
        fields: [
          'sectorSize',
          'qualityAdjPower',
          'rawBytePower',
          'increasePledge',
          'encapsulationGas',
          'windowPost',
          'penalty',
          'blockLoss',
          'faultedSector',
        ],
      });
    }
  }

  _getEncapsulationGas(minersGas: MinerGas[]) {
    return minersGas.map(minerGas => {
      const preAndProveBatchBurn = minerGas.preAndProveBatchBurn.reduce(
        (acc, item) => {
          return acc.plus(item.gasfee || 0);
        },
        new BigNumber(0)
      );

      return {
        miner: minerGas.miner,
        gas: minerGas.minerGasDetails
          .reduce((acc, item) => {
            return acc.plus(item.gasfee || 0);
          }, preAndProveBatchBurn)
          .toNumber(),
        windowPost:
          minerGas.minerGasDetails.find(item => {
            return item.method === '5';
          })?.gasfee || 0,
        penalty: minerGas.minerPenalty,
      };
    });
  }
}
