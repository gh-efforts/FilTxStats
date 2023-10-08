import axios, { Axios } from 'axios';
import * as dayjs from 'dayjs';
import * as isBetween from 'dayjs/plugin/isBetween';
import * as _ from 'lodash';
import type {
  IGet,
  IPost,
  Ilonelyblock,
  Lonelyblock,
  LonelyblockRes,
} from './interface';
dayjs.extend(isBetween);

export class FilutilsSdk {
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

  private async _post<T>(
    params: IPost,
    errorMsg: string[] = [],
    errorCount: number = 0
  ): Promise<T> {
    const { url, data } = params;
    try {
      const res = await this._instance.post(url, data);
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

  private async lonelyblockV2(param: Ilonelyblock) {
    return this._post<LonelyblockRes>({
      url: '/orphanblock',
      data: param,
    });
  }

  async lonelyblock(param: Ilonelyblock) {
    return await this.lonelyblockV2(param);
  }

  async getMinerLonelyblock(
    miner: string,
    startAt: string,
    endAt: string
  ): Promise<{
    miner: string;
    lonelyblock: Lonelyblock[];
  }> {
    return new Promise(async (resolve, reject) => {
      try {
        let page = 1;
        const lonelyblock: Lonelyblock[] = [];

        while (true) {
          const res = await this.lonelyblock({
            miner,
            height: 0,
            pageIndex: page,
            pageSize: 20,
          });

          if (!res.data || res.data.length === 0) {
            break;
          }

          const blocks = res.data.filter(item => {
            return dayjs(item.mineTime).isBetween(startAt, endAt);
          });

          if (blocks.length > 0) {
            console.log('筛选后 block 写入 ', blocks && blocks.length);
            lonelyblock.push(...blocks);
          } else {
            console.log('筛选后 block 为空 ', miner, startAt, endAt);
            break;
          }

          page += 1;
          continue;
        }
        resolve({
          miner,
          lonelyblock,
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
