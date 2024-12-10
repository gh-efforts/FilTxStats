import { getHeightByTime } from '@dws/utils';
import { Provide } from '@midwayjs/core';
import BigNumber from 'bignumber.js';
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
    return this.query<{ dealid: string }>(SQL, [miner], true).then(res => {
      return {
        miner,
        type: res && res.dealid ? 'DC' : 'CC',
      };
    });
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
        sum( initial_pledge ) as initiapledge
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
      initiapledge: string;
    }>(SQL, [miner, startHeight - 1, endHeight - 1], true);
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
    console.log('xxxx', result);
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

  async getMinerSectorSealCount(miner: string, startAt: string, endAt: string) {
    const [startHeight, endHeight] = [
      getHeightByTime(startAt),
      getHeightByTime(endAt),
    ];

    const SQL = `
      SELECT
        count(*) as count
      FROM
        miner_sector_infos_v7 
      WHERE
        miner_id = ? 
        AND activation_epoch >= ? 
        AND activation_epoch <= ? 
        AND sector_key_cid IS NULL;
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

  async getMinerSectorPledge(miner: string) {
    const SQL = `
      SELECT
        miner_id as miner, 
        locked_funds as lockedfunds,
        initial_pledge as initialpledge,
        pre_commit_deposits as precommitdeposits
      FROM
        miner_locked_funds 
      WHERE
        miner_id = ? 
      ORDER BY
        height DESC 
        LIMIT 1;
    `;
    return this.query<{
      miner: string;
      lockedfunds: string;
      initialpledge: string;
      precommitdeposits: string;
    }>(SQL, [miner], true);
  }

  // 获取 miner 实际区块出块
  async getMinerActualBlockOut(miner: string, startAt: string, endAt: string) {
    const [startHeight, endHeight] = [
      getHeightByTime(startAt),
      getHeightByTime(endAt),
    ];

    const SQL = `
      SELECT
        count(*) as count 
      FROM
        vm_messages 
      WHERE
        "from" = 'f02' 
        AND "to" = ?
        AND method = ?
        AND height >= ?
        AND height <= ?;
    `;
    const result = await this.query<{ count: string }>(
      SQL,
      [miner, gasMethod.BlockOut, startHeight, endHeight],
      true
    );

    return {
      miner,
      count: result.count,
    };
  }
  // 获取节点的过期扇区、续期扇区数量
  // event: SECTOR_EXTENDED 续期、SECTOR_EXPIRED or SECTOR_TERMINATED 到期
  async getMinerSectorEETTypeCount(
    miner: string,
    event: string[],
    startAt: string,
    endAt: string
  ) {
    const [startHeight, endHeight] = [
      getHeightByTime(startAt),
      getHeightByTime(endAt),
    ];

    const SQL = `
      SELECT
        count(*) as count
      FROM
        miner_sector_events 
      WHERE
        miner_id = ?
        AND event in (?)
        AND height >= ? 
        AND height <= ?;
    `;

    const result = await this.query<{ count: string }>(
      SQL,
      [miner, event, startHeight, endHeight],
      true
    );
    return {
      miner,
      count: result.count,
    };
  }

  //  - 预计出快：（结束高度算力/结束高度全网算力）* (4.8 * 120) * （(结束高度-开始高度) * 30/3600）
  async getMinerProdictBlockOut(
    miner: string,
    startAt: string,
    endAt: string,
    actorQualityadjpower?: string
  ) {
    const [startHeight, endHeight] = [
      getHeightByTime(startAt),
      getHeightByTime(endAt),
    ];

    // const ACTOR_SQL = `
    //   SELECT
    //     miner_id as miner,
    //     quality_adj_power as qualityadjpower
    //   FROM
    //     power_actor_claims
    //   WHERE
    //     miner_id = ?
    //     AND height <= ?
    //   ORDER BY
    //     height DESC
    //     LIMIT 1;
    // `;
    // 全网算力
    const CHAIN_SQL = `
      SELECT
        total_qa_bytes_power as totalqabytespower
      FROM
        chain_powers 
      WHERE
        height BETWEEN ? AND ? 
      ORDER BY height DESC
      LIMIT 1;
    `;
    // const actor = await this.query<{ miner: string; qualityadjpower: string }>(
    //   ACTOR_SQL,
    //   [miner, endHeight],
    //   true
    // );
    const chain = await this.query<{ totalqabytespower: string }>(
      CHAIN_SQL,
      [endHeight - 5, endHeight],
      true
    );
    return {
      miner,
      num: actorQualityadjpower
        ? BigNumber(actorQualityadjpower)
            .div(chain.totalqabytespower)
            .multipliedBy(4.8 * 120)
            .multipliedBy(((endHeight - startHeight) * 30) / 3600)
            .toFixed(0)
        : 0,
    };
  }

  async getMinerBalance(miner: string) {
    const SQL = `
      SELECT 
        id as miner,
        balance 
      FROM
        actors 
      WHERE
        id = ? 
      ORDER BY
        height DESC 
        LIMIT 1
  `;
    const result = await this.query<{ miner: string; balance: string }>(
      SQL,
      [miner],
      true
    );
    return result;
  }

  // 获取终止扇区的节点
  async getStopSectorMiner(startHeight: number, endHeight: number) {
    const SQL = `
      WITH filtered_dgo AS (
        SELECT *
        FROM derived_gas_outputs
        WHERE height BETWEEN ${startHeight} AND ${endHeight}
          AND (actor_family = 'storageminer' AND method = 9)
      ), filtered_pm AS (
        SELECT *
        FROM parsed_messages
        WHERE height BETWEEN ${startHeight} AND ${endHeight}
        AND method ='TerminateSectors'
      ),filtered_vm AS (
        SELECT height, source, "from", value
        FROM vm_messages
        WHERE height BETWEEN ${startHeight} AND ${endHeight}
        AND method = 0
        AND "to" = 'f099'
      )
      SELECT
        dgo."to",
        SUM((
          SELECT sum((s.value::int))
          FROM jsonb_array_elements(pm.params->'Terminations') t,
          jsonb_each_text(t->'Sectors') s
          WHERE s.key = 'elemcount'
        )) AS counts,
        SUM(dgo.base_fee_burn + dgo.over_estimation_burn + dgo.miner_tip ) AS gas_fee,
        SUM(COALESCE(vm.value, 0)) + SUM(COALESCE(vmm.value, 0)) AS burn
      FROM
        filtered_dgo dgo
      INNER JOIN
        filtered_pm pm
          ON dgo.height = pm.height
          AND dgo.cid = pm.cid
      LEFT JOIN
        filtered_vm vm
          ON dgo.height = vm.height
          AND dgo.cid = vm.source
          AND dgo."to" = vm."from"
      LEFT JOIN
        filtered_vm vmm
          ON dgo.height = vmm.height
          AND dgo.cid = vmm.source
          AND 'f05' = vmm."from"
      GROUP BY
        dgo."to"
      ORDER BY
        dgo."to"
    `;
    const result = await this.query<
      {
        to: string;
        counts: number;
        gas_fee: string;
        burn: string;
      }[]
    >(SQL, []);
    return result;
  }
}
