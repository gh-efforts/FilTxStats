import { getHeightByTime } from '@dws/utils';
import { Provide } from '@midwayjs/core';
import { LilyService } from '../../core/lily';
import { gasMethod } from '../comm/gasMethod';
import { MinerGas } from './interface';

@Provide()
export class LilyMapping extends LilyService {
  getLilyByMinerType(miner: string) {
    const SQL = `
      SELECT
        deal_id as dealId 
      FROM
        market_deal_proposals 
      WHERE
        provider_id = ?
        AND EXISTS ( SELECT 1 FROM market_deal_states WHERE market_deal_states.deal_id = market_deal_proposals.deal_id ) 
        LIMIT 1;
    `;
    return this.query<{ dealId: string } | null>(SQL, [miner], true).then(
      res => {
        return {
          miner,
          type: res && res.dealId ? 'DC' : 'CC',
        };
      }
    );
  }

  /**
   * 获取 miner 一段时间的质押量
   * @param miner 节点号
   * @param startAt 起始时间
   * @param endAt 结束时间
   */
  async getLilyMinerPledgeIncr(miner: string, startAt: string, endAt: string) {
    const [startHeight, endHeight] = [
      getHeightByTime(startAt),
      getHeightByTime(endAt),
    ];
    const SQL = `
      SELECT
        miner_id as miner,
        sum( initial_pledge ) as initiaPledge
      FROM
        miner_sector_infos_v7 
      WHERE
        miner_id =? 
        AND height >=? 
        AND height <=?
      GROUP BY miner_id
    `;
    return this.query<{
      miner: string;
      initiaPledge: string;
    } | null>(SQL, [miner, startHeight - 1, endHeight - 1], true);
  }

  async getMinerGas(
    miner: string,
    startAt: string,
    endAt: string
  ): Promise<MinerGas> {
    const [startHeight, endHeight] = [
      getHeightByTime(startAt),
      getHeightByTime(endAt),
    ];
    const method = [
      gasMethod.SubmitWindowedPoSt,
      gasMethod.PreCommitSector,
      gasMethod.PreCommitSectorBatch,
      gasMethod.ProveCommitSector,
      gasMethod.ProveCommitAggregate,
    ];
    const gasSQL = `
      SELECT 
        method,
        SUM ( base_fee_burn + over_estimation_burn + miner_tip ) AS gasFee 
      FROM
        derived_gas_outputs 
      WHERE
        "to" = ?
        AND height >= ? 
        AND height <= ? 
        AND method IN ( ? ) 
      GROUP BY method
    `;
    // gas类型
    const minerGasDetails = await this.query<
      {
        method: string;
        gasfee: string;
      }[]
    >(gasSQL, [miner, startHeight, endHeight, method], false);

    const penaltySQL = `
      SELECT 
        SUM( miner_penalty ) as count
      FROM
        derived_gas_outputs 
      WHERE
        "to" = ? 
        AND height >= ? 
        AND height <= ?
    `;
    // 查询矿工惩罚
    const minerPenalty = await this.query<{
      count: string;
    }>(penaltySQL, [miner, startHeight, endHeight], true);

    const preAndProveMethod = [
      gasMethod.PreCommitSectorBatch,
      gasMethod.ProveCommitAggregate,
    ];

    const preSQL = `
      SELECT
        pm.method,
        SUM ( vm.value ) AS gasFee 
      FROM
        vm_messages vm
        LEFT JOIN messages pm ON vm.height = pm.height 
        AND vm.SOURCE = pm.CID 
      WHERE
        vm.height >= ? 
        AND vm.height <= ? 
        AND vm.method = 0 
        AND vm."to" = 'f099' 
        AND vm."from" = ? 
        AND pm.method IN ( ? ) 
      GROUP BY
        pm.method
    `;
    // 消耗
    const preAndProveBatchBurn = await this.query<
      {
        method: string;
        gasfee: string;
      }[]
    >(preSQL, [startHeight, endHeight, miner, preAndProveMethod], false);

    return {
      miner,
      minerGasDetails,
      preAndProveBatchBurn,
      minerPenalty: minerPenalty.count,
    };
  }

  async getFaultedSector(miner: string, startAt: string, endAt: string) {
    const [startHeight, endHeight] = [
      getHeightByTime(startAt),
      getHeightByTime(endAt),
    ];

    const SQL = `
      SELECT 
        count(*) 
      FROM
        miner_sector_events 
      WHERE
        miner_id = ? 
        AND event = 'SECTOR_FAULTED' 
        AND height >= ? 
        AND height <= ?;
    `;
    const result = await this.query<{ count: string }>(
      SQL,
      [miner, startHeight, endHeight],
      true
    );
    return {
      miner,
      count: result.count,
    };
  }

  async getMinerInfo(miner: string) {
    const SQL = `
      SELECT
        miner_id as miner,
        state_root as stateRoot,
        sector_size as sectorSize 
      FROM
        miner_infos 
      WHERE
        miner_id = ?
      ORDER BY
        height DESC 
        LIMIT 1;
    `;
    return this.query<{ miner: string; stateroot: string; sectorsize: string }>(
      SQL,
      [miner],
      true
    );
  }

  async getMinerPower(miner: string, endAt: string) {
    const endHeight = getHeightByTime(endAt);
    const SQL = `
      SELECT
        miner_id as miner,
        raw_byte_power as rawBytePower,
        quality_adj_power  as qualityAdjPower
      FROM
        power_actor_claims 
      WHERE
        miner_id = ? 
        AND height <= ? 
      ORDER BY
        height DESC 
        LIMIT 1;
    `;
    return this.query<{
      miner: string;
      rawbytepower: string;
      qualityadjpower: string;
    }>(SQL, [miner, endHeight], true);
  }
}
