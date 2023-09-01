import axios, { Axios } from 'axios';
import * as _ from 'lodash';
import type { IGet, IPost, ITotalIndicatorsRes } from './interface';

export class FilscanSdk {
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
      console.log('error', `Filscan GET ${url} 方法出错：${message}`);
      errorMsg.push(`Filscan GET ${url} 方法出错：${message}`);

      if (errorCount >= 3) {
        throw new Error(JSON.stringify(errorMsg));
      }
      return this._get(params, errorMsg, errorCount + 1);
    }
  }

  private async _post<T>(
    params: IPost,
    errorMsg: string[] = [],
    errorCount: number = 0
  ): Promise<T> {
    const { url, data } = params;
    try {
      const res = await this._instance.post(url, {
        data,
      });

      if (res.status < 200 || res.status >= 300) {
        throw new Error(JSON.stringify(res));
      }

      return res.data;
    } catch (e) {
      const message = (e as Error).message;
      console.log('error', `Filscan Post ${url} 方法出错：${message}`);

      errorMsg.push(`Filscan Post ${url} 方法出错：${message}`);

      if (errorCount >= 3) {
        throw new Error(JSON.stringify(errorMsg));
      }
      return this._post(params, errorMsg, errorCount + 1);
    }
  }

  /**
   * 根据 count 数量拆分 minerIds，分批请求
   * @param url 接口地址
   * @param minerIds 节点列表
   * @param count 每次请求的节点数量
   * @param params 参数
   */
  async requestChunk(
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

  async getFilcoinNetworkData() {
    const { result } = await this._post<ITotalIndicatorsRes>({
      url: '/v1/TotalIndicators',
      data: {},
    });
    return result?.total_indicators || {};
  }
}
