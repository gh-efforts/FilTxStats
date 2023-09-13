import {
  MinerDailyStatsMapping,
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

Array.prototype.get = function <T>(key: string, value: any): T | undefined {
  return this.find(item => {
    if (!item) {
      return false;
    }
    return item[key] === value;
  });
};

@Provide()
export class MinerService extends BaseService<MinerEncapsulationEntity> {
  @Inject()
  mapping: MinerMapping;

  @Inject()
  minerEncapsulationMapping: MinerEncapsulationMapping;

  @Inject()
  minerDailyStatsMapping: MinerDailyStatsMapping;

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
    // 实际出快
    const minersActualBlockOut = await Promise.all(
      miners.map(miner => {
        return limit(() =>
          this.lilyMapping.getMinerActualBlockOut(miner, startAt, endAt)
        );
      })
    );

    // 预计出快
    const minersProdictBlockOut = await Promise.all(
      miners.map(miner => {
        return limit(() =>
          this.lilyMapping.getMinerProdictBlockOut(miner, startAt, endAt)
        );
      })
    );

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
        return limit(() =>
          this.lilyMapping.getMinerInfo(miner).then(res => {
            if (!res) {
              // 补充链上数据
              return this.lotus.getStateMinerInfo(miner);
            }
            return res;
          })
        );
      })
    );
    // 查询昨日算力
    const minersPower = await Promise.all(
      miners.map(miner => {
        return limit(() => this.lilyMapping.getMinerPower(miner, endAt));
      })
    );

    const minersSectorSealCount = await Promise.all(
      miners.map(miner => {
        return limit(() =>
          this.lilyMapping.getMinerSectorSealCount(miner, startAt, endAt)
        );
      })
    );

    const blocks = miners.map(miner => {
      return {
        miner,
        actualBlockOut: minersActualBlockOut.get('miner', miner)?.count || 0,
        prodictBlockOut: minersProdictBlockOut.get('miner', miner)?.num || 0,
        blockLoss:
          minersLonelyblock.get('miner', miner)?.lonelyblock.length || 0,
        dateAt: endAt,
      };
    });

    await this.minerDailyStatsMapping.bulkCreateMinerDailyStats(blocks, {
      updateOnDuplicate: [
        'actualBlockOut',
        'prodictBlockOut',
        'blockLoss',
        'updatedAt',
      ],
    });

    const datas = miners.map(miner => {
      return {
        miner,
        sectorSize: minersInfo.get('miner', miner)?.sectorsize || 0,
        qualityAdjPower: minersPower.get('miner', miner)?.qualityadjpower || 0,
        rawBytePower: minersPower.get('miner', miner)?.rawbytepower || 0,
        increasePledge: minersPledgeIncr.get('miner', miner)?.initiaPledge || 0,
        encapsulationGas: getMinersGas.get('miner', miner)?.gas || 0,
        windowPost: getMinersGas.get('miner', miner)?.windowPost || 0,
        penalty: getMinersGas.get('miner', miner)?.penalty || 0,
        blockLoss:
          minersLonelyblock.get('miner', miner)?.lonelyblock.length || 0,
        faultedSector: minersFaultedSector.get('miner', miner)?.count || 0,
        sectorSealCount: minersSectorSealCount.get('miner', miner)?.count || 0,
        dateAt: endAt,
      };
    });

    await this.minerEncapsulationMapping.bulkCreateMinerEncapsulation(datas, {
      updateOnDuplicate: [
        'sectorSize',
        'qualityAdjPower',
        'rawBytePower',
        'increasePledge',
        'encapsulationGas',
        'windowPost',
        'penalty',
        'blockLoss',
        'faultedSector',
        'sectorSealCount',
        'updatedAt',
      ],
    });

    return true;
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
