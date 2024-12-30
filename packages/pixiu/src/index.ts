import { bigDiv, bigMul, getTimeByHeight, transferFilValue } from '@dws/utils';
import { LarkSdk } from '@lark/core';
import axios, { Axios } from 'axios';
import * as dayjs from 'dayjs';
import * as _ from 'lodash';

import type {
  GetAvgSealGasRes,
  IGasFeeByDateRes,
  IGet,
  MinerBaseRes,
  MinerDcSealedRes,
  MinerPledgeRes,
  MinerRewardDetailRes,
  MinerRewardRes,
  MinerSectorStatsPledgeRes,
  MinerStaticRes,
  QueryMinerPowerRes,
} from './interface';

export type {
  IGasFeeByDateRes,
  IGet,
  MinerBaseRes,
  MinerDcSealedRes,
  MinerPledgeRes,
  MinerRewardDetailRes,
  MinerRewardRes,
  MinerStaticRes,
};

export class PixiuSdk {
  private _instance: Axios;

  private lark: LarkSdk;
  /**
   *
   * @param url pixiu访问地址
   */
  constructor(url: string) {
    this._instance = axios.create({
      baseURL: url,
      timeout: 1000 * 60 * 2,
    });

    this.lark = new LarkSdk();
  }

  /**
   *  http Get 请求
   * @param params query 参数
   * @param errorMsg 错误信息
   * @param errorCount 错误次数， 超过 3 次则抛出错误
   */
  private async _get(
    params: IGet,
    errorMsg: string[] = [],
    errorCount: number = 0
  ): Promise<any> {
    const { url, query } = params;
    try {
      const res = await this._instance.get(url, {
        params: query,
      });

      if (res.status < 200 || res.status >= 300) {
        throw new Error(JSON.stringify(res));
      }

      return res.data;
    } catch (e) {
      console.log('e', e);
      const message = (e as Error).message;
      console.log('error', `Pixiu GET ${url} 方法出错：${message}`);
      errorMsg.push(`Pixiu GET ${url} 方法出错：${message}`);

      if (errorCount >= 3) {
        await this.lark.sendLarkByQueueStatus(
          '查询 Pixiu ',
          false,
          errorMsg.join('\n')
        );
        throw new Error(errorMsg.join('\n'));
      }
      return this._get(params, errorMsg, errorCount + 1);
    }
  }

  /**
   * 根据 count 数量拆分 minerIds，分批请求
   * @param url 接口地址
   * @param minerIds 节点列表
   * @param count 每次请求的节点数量
   * @param params 参数
   */
  private async requestChunk(
    url: string,
    minerIds: string[],
    count: number,
    params: {
      [key: string]: any;
    } = {}
  ) {
    const arr = [];

    const chunks = _.chunk(minerIds, count);

    for (const chunk of chunks) {
      const res = await this._get({
        url,
        query: {
          minerId: chunk.join(','),
          ...params,
        },
      });
      if (res.data instanceof Array) {
        arr.push(...res.data);
      } else {
        arr.push(...res.data.list);
      }
    }

    return arr;
  }

  /**
   * 获取  miner 数据快照
   * @param minerIds 节点列表
   */
  public async getMinerBaseInfo(minerIds: string[]): Promise<MinerBaseRes[]> {
    return this.requestChunk('/v2/miner/minerBaseInfo', minerIds, 5);
  }

  /**
   * 获取 miner 基础静态数据
   * @param minerIds 节点列表
   */
  public async getMinerStaticState(
    minerIds: string[]
  ): Promise<MinerStaticRes[]> {
    return this.requestChunk('/v2/miner/minerStaticState', minerIds, 5);
  }
  /**
   *  获取 miner gas fee
   * @param minerIds 节点列表
   * @param date 日期
   */
  public async gasMinerGasFee(
    minerIds: string[],
    date: string
  ): Promise<IGasFeeByDateRes[]> {
    return this.requestChunk('/v2/miner/gasFeeDetailByDate', minerIds, 5, {
      date,
    });
  }

  /**
   * 获取 miner 奖励
   * @param minerIds 节点列表
   * @param startAt 起始日期
   * @param endAt 终止日期
   */
  public async getMinerReward(
    minerIds: string[],
    startAt: number,
    endAt: number
  ): Promise<MinerRewardRes[]> {
    return this.requestChunk('/v2/miner/rewards', minerIds, 5, {
      startTime: startAt,
      endTime: endAt,
    });
  }

  /**
   *
   * 获取算力新增
   * @param {string[]} minerIds 节点列表
   * @param {string} date 日期
   */
  public async getMinerDcSealed(
    minerIds: string[],
    date: string
  ): Promise<MinerDcSealedRes[]> {
    return this.requestChunk('/v2/chain/dc/sealed', minerIds, 5, {
      date,
    });
  }

  /**
   * 质押币
   * @param minerIds 节点列表
   * @param date 日期
   */
  public async getMinerPledge(
    minerIds: string[],
    date: string
  ): Promise<MinerPledgeRes[]> {
    return this.requestChunk('/v2/miner/minerPledge', minerIds, 5, {
      date,
    });
  }

  /**
   * 获取 miner 扇区到期
   * @param minerIds 节点列表
   * @returns
   */
  public async getSectorStatsPledge(
    minerIds: string[]
  ): Promise<MinerSectorStatsPledgeRes[]> {
    return this.requestChunk('/v2/miner/sectorStatsPledge', minerIds, 5);
  }

  /**
   * 按照范围日期获取 miner 的区块奖励，区块维度
   * @param minerIds 节点列表
   * @param startAt 起始时间 unix
   * @param endAt 结束时间 unix
   */
  public async getMinerRewardDetail(
    minerIds: string[],
    startAt: number,
    endAt: number
  ): Promise<MinerRewardDetailRes[]> {
    let result = (await this.requestChunk(
      '/v2/miner/rewardDetail',
      minerIds,
      5,
      {
        startTime: startAt,
        endTime: endAt,
      }
    )) as MinerRewardDetailRes[];
    return result.map(item => {
      item.Rewards =
        item.Rewards?.map(
          ({ miner_id: miner, reward: rawReward, cid, height }) => {
            const time = getTimeByHeight(height);
            const hour = dayjs(time).hour();
            const reward = transferFilValue(rawReward);
            const lockedReward = bigMul(reward, 0.75).toString();
            const dailyReward = bigDiv(lockedReward, 180).toString();
            return {
              miner,
              cid,
              time,
              height,
              hour,
              reward,
              lockedReward,
              dailyReward,
            };
          }
        ) || [];
      return item;
    });
  }

  public async getAvgSealGas(
    startHeight: number,
    endHeight: number
  ): Promise<GetAvgSealGasRes> {
    let ret = await this._get({
      url: 'v2/chain/avgSealGas',
      query: {
        startHeight,
        endHeight,
      },
    });
    if (ret.code != 0) {
      throw new Error(`getAvgSealGas ret.code=${ret.code}`);
    }
    return ret && ret.data;
  }

  /**
   * 查询节点算力，支持过去时间查询
   * 为 getMinerProdictBlockOut 服务，直接查
    SELECT
        miner_id as miner,
        quality_adj_power as qualityadjpower 
      FROM
        power_actor_claims 
      WHERE
        miner_id = ?
        AND height <= ? 
      ORDER BY
        height DESC 
        LIMIT 1;
    查不出来数据，替换成 pixiu 查询
   */
  public async queryMinerPower(
    minerId: string,
    dateSec: string
  ): Promise<QueryMinerPowerRes[]> {
    let ret = await this._get({
      url: '/v2/dspa/miner/power',
      query: {
        minerId,
        dateTime: dateSec,
      },
    });
    if (ret.code != 0) {
      throw new Error(`queryMinerPower ret.code=${ret.code}`);
    }
    return ret && ret.data;
  }
}
