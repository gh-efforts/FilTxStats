import {
  MinerMapping,
  MinerSectorEntity,
  MinerSectorMapping,
} from '@dws/entity';
import { getHeightByTime, getYesterdayTime } from '@dws/utils';
import { FilutilsSdk } from '@filutils/http';
import { LotusSdk } from '@lotus/http';
import { Config, Init, Inject, Provide } from '@midwayjs/core';
import * as pLimit from 'p-limit';
import { BaseService } from '../../core/baseService';
import { LilyMapping } from '../mapping/lily';
// import './global';

Array.prototype.get = function <T>(key: string, value: any): T | undefined {
  return this.find(item => {
    if (!item) {
      return false;
    }
    return item[key] === value;
  });
};

@Provide()
export class MinerSectorService extends BaseService<MinerSectorEntity> {
  @Inject()
  mapping: MinerMapping;

  @Inject()
  minerSectorMapping: MinerSectorMapping;

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

  async syncMinersSector() {
    const miners = await this.getMinerIds();
    const { startAt, endAt } = await getYesterdayTime();

    const endHeight = getHeightByTime(endAt);
    const limit = pLimit(5);
    const cids = await this.lotus.getChainGetTipSetByHeight(endHeight);

    // 查询扇区大小
    const minersInfo = await Promise.all(
      miners.map(miner => {
        return limit(() => this.lilyMapping.getMinerInfo(miner));
      })
    );

    const minersStateSector = await Promise.all(
      miners.map(miner => {
        return limit(() => this.lotus.getStateMinerSectorCount(miner, cids));
      })
    );
    // 查询链上恢复中的扇区
    const minersStateRecoveries = await Promise.all(
      miners.map(miner => {
        return limit(() => this.lotus.getStateMinerRecoveries(miner, cids));
      })
    );
    // 获取节点质押
    const minersSectorPledge = await Promise.all(
      miners.map(miner => {
        return limit(() => this.lilyMapping.getMinerSectorPledge(miner));
      })
    );

    const minersExtended = await Promise.all(
      miners.map(miner => {
        return limit(() =>
          this.lilyMapping.getMinerSectorEETTypeCount(
            miner,
            ['SECTOR_EXTENDED'],
            startAt,
            endAt
          )
        );
      })
    );

    const minersExpiredOrTerminated = await Promise.all(
      miners.map(miner => {
        return limit(() =>
          this.lilyMapping.getMinerSectorEETTypeCount(
            miner,
            ['SECTOR_EXPIRED', 'SECTOR_TERMINATED'],
            startAt,
            endAt
          )
        );
      })
    );

    // 新增扇区数
    const minersSectorSealCount = await Promise.all(
      miners.map(miner => {
        return limit(() =>
          this.lilyMapping.getMinerSectorSealCount(miner, startAt, endAt)
        );
      })
    );

    // 查询昨日算力
    const minersPower = await Promise.all(
      miners.map(miner => {
        return limit(() => this.lilyMapping.getMinerPower(miner, endAt));
      })
    );

    const data = miners.map(miner => {
      return {
        miner,
        sectorSize: minersInfo.get('miner', miner)?.sectorsize || 0,
        qualityAdjPower: minersPower.get('miner', miner)?.qualityadjpower || 0,
        rawBytePower: minersPower.get('miner', miner)?.rawbytepower || 0,
        sectorSealCount: minersSectorSealCount.get('miner', miner)?.count || 0,
        correctSectorCount: minersStateSector.get('miner', miner)?.active || 0,
        errorSectorCount: minersStateSector.get('miner', miner)?.faulty || 0,
        revertingInSectorCount:
          minersStateRecoveries.get('miner', miner)?.count || 0,
        initialPledge:
          minersSectorPledge.get('miner', miner)?.initialpledge || 0,
        renewSectorCount: minersExtended.get('miner', miner)?.count || 0,
        staleDatedSectorCount:
          minersExpiredOrTerminated.get('miner', miner)?.count || 0,
        dateAt: endAt,
      };
    });

    await this.minerSectorMapping.bulkCreateMinerSector(data, {
      updateOnDuplicate: [
        'sectorSize',
        'qualityAdjPower',
        'rawBytePower',
        'sectorSealCount',
        'correctSectorCount',
        'errorSectorCount',
        'revertingInSectorCount',
        'initialPledge',
        'renewSectorCount',
        'staleDatedSectorCount',
      ],
    });
    return true;
  }
}
