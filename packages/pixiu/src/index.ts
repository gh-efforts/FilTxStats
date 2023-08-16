import axios, { Axios } from 'axios';
import {
  IGasFeeByDateRes,
  IGet,
  MinerBaseRes,
  MinerStaticRes,
} from './interface';

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
      arr.push(...res.data);
    }

    return arr;
  }

  // 获取  miner 数据快照
  public async getMinerBaseInfo(minerIds: string[]): Promise<MinerBaseRes[]> {
    return this.requestChunk('/v2/miner/minerBaseInfo', minerIds, 5);
  }

  // 获取 miner 基础静态数据
  public async getMinerStaticState(
    minerIds: string[]
  ): Promise<MinerStaticRes[]> {
    return this.requestChunk('/v2/miner/minerStaticState', minerIds, 5);
  }

  public async gasFeeByDate(
    minerName: string,
    date: string
  ): Promise<IGasFeeByDateRes[]> {
    const res = await this._get({
      url: `/v2/miner/gasFeeByDate`,
      query: {
        minerId: minerName,
        date,
      },
    });

    return res.data;
  }
}
