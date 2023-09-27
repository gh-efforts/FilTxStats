import { Provide } from '@midwayjs/core';
import { LilyService } from '../../core/lily';

/**
 * 查询一些全网数据
 */
@Provide()
export class NetworkMapping extends LilyService {
  public getPowerByMinH(minHeight: number) {
    let SQL = `
      SELECT
        total_raw_bytes_power,
        total_qa_bytes_power
      FROM
        chain_powers 
      WHERE
        height >= ? 
      ORDER BY
        height ASC 
        LIMIT 1;
    `;
    return this.query<{
      total_raw_bytes_power: string;
      total_qa_bytes_power: string;
    }>(SQL, [minHeight], true).then(res => {
      return res;
    });
  }

  public getPowerByMaxH(maxHeight: number) {
    let SQL = `
      SELECT
        total_raw_bytes_power,
        total_qa_bytes_power
      FROM
        chain_powers 
      WHERE
        height <= ? 
      ORDER BY
        height DESC 
        LIMIT 1;
    `;
    return this.query<{
      total_raw_bytes_power: string;
      total_qa_bytes_power: string;
    }>(SQL, [maxHeight], true).then(res => {
      return res;
    });
  }

  public getRewardByMinH(minHeight: number) {
    let SQL = `
      SELECT
        total_mined_reward
      FROM
        chain_rewards 
      WHERE
        height >= ? 
      ORDER BY
        height ASC 
        LIMIT 1;
    `;
    return this.query<{
      total_mined_reward: string;
    }>(SQL, [minHeight], true).then(res => {
      return res;
    });
  }

  public getRewardByMaxH(maxHeight: number) {
    let SQL = `
      SELECT
        total_mined_reward
      FROM
        chain_rewards 
      WHERE
        height <= ? 
      ORDER BY
        height DESC 
        LIMIT 1;
    `;
    return this.query<{
      total_mined_reward: string;
    }>(SQL, [maxHeight], true).then(res => {
      return res;
    });
  }

  /**
   *  to=f099， from =矿工地址 就是惩罚的 msg
   * from=f05 这种属于官方内部地址，不能改算进来，要排除掉
   * @param minHeight
   * @param maxHeight
   * @returns
   */
  public getPenaltyByHeight(minHeight: number, maxHeight: number) {
    let SQL = `
      SELECT
        SUM ( "value" ) as totalvalue
      FROM
        vm_messages 
      WHERE
        height >= ? 
        AND height <= ? 
        AND "to" = 'f099' 
        AND LENGTH ( "from" ) >= 4 
      GROUP BY
        "to"
    `;
    return this.query<{
      totalvalue: string;
    }>(SQL, [minHeight, maxHeight], true).then(res => {
      return {
        totalvalue: (res && res.totalvalue) || 0,
      };
    });
  }
}
