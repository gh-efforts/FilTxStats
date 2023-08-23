import axios, { Axios } from 'axios';
import type {
  IGasFeeByDateRes,
  IGet,
  MinerBaseRes,
  MinerDcSealedRes,
  MinerPledgeRes,
  MinerRewardDetailRes,
  MinerRewardRes,
  MinerStaticRes,
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

import * as _ from 'lodash';

export class PixiuSdk {
  private _instance: Axios;

  /**
   *
   * @param url pixiu访问地址
   */
  constructor(url: string) {
    this._instance = axios.create({
      baseURL: url,
      timeout: 1000 * 60 * 2,
    });
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
      const message = (e as Error).message;
      console.log('error', `Pixiu GET ${url} 方法出错：${message}`);
      errorMsg.push(message);

      if (errorCount >= 3) {
        // TODO send to lark
        throw new Error(JSON.stringify(errorMsg));
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
    return this.requestChunk('/v2/miner/gasFeeByDate', minerIds, 5, {
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
    return this.requestChunk('/v2/miner/rewardDetail', minerIds, 5, {
      startTime: startAt,
      endTime: endAt,
    });
  }
}
