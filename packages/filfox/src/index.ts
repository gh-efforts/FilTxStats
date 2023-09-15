import { bigDiv, bigMul, getTimeByHeight, transferFilValue } from '@dws/utils';
import axios, { Axios } from 'axios';
import * as dayjs from 'dayjs';
import * as _ from 'lodash';
import type {
  IBlocksRes,
  IChangeAddressRes,
  IGet,
  IMessageRes,
  IMinerInfo,
} from './interface';

export class FilfoxSdk {
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

  public blocks(
    minerId: string,
    page = 0,
    pageSize = 100
  ): Promise<IBlocksRes> {
    return this._get({
      url: `/address/${minerId}/blocks`,
      query: {
        page,
        pageSize,
      },
    });
  }

  public async changeOwnerAddress(
    minerName: string
  ): Promise<IChangeAddressRes[]> {
    const method = 'ChangeOwnerAddress';
    const res = await this._get({
      url: `/address/${minerName}/messages`,
      query: {
        page: 0,
        pageSize: 50,
        method,
      },
    });
    return res.messages;
  }

  public async changeWorkerAddress(
    minerName: string
  ): Promise<IChangeAddressRes[]> {
    const method = 'ChangeWorkerAddress';
    const res = await this._get({
      url: `/address/${minerName}/messages`,
      query: {
        page: 0,
        pageSize: 50,
        method,
      },
    });
    console.log('res', res);
    return res.messages;
  }

  public async getMessage(cid: string): Promise<IMessageRes> {
    const res = await this._get({
      url: `/message/${cid}`,
      query: {},
    });
    return res;
  }

  public getMinerDetail(minerId: string): Promise<IMinerInfo> {
    return this._get({
      url: `/address/${minerId}`,
      query: {},
    });
  }

  // 获取节点奖励记录，以日期组合
  async getMinerReward(miner: string, startHeight: number, endHeight: number) {
    const records: {
      miner: string;
      cid: string;
      height: number;
      reward: string;
      time: string;
      hour: number;
      lockedReward: string;
      dailyReward: string;
    }[] = [];
    let page = 0;
    while (true) {
      const { totalCount, blocks } = await this.blocks(miner, page);
      if (
        totalCount === 0 ||
        blocks.length === 0 ||
        blocks[0].height < startHeight
      ) {
        return records;
      }

      if (blocks[blocks.length - 1].height > endHeight) {
        page += 1;
        continue;
      }

      blocks.forEach(({ height, reward: rawReward, cid }) => {
        if (height < startHeight) {
          return records;
        }
        if (height <= endHeight) {
          // 根据高度获取时间
          const time = getTimeByHeight(height);
          // 根据时间获取小时
          const hour = dayjs(time).hour();
          // 转换奖励单位为 Fil
          const reward = transferFilValue(rawReward);
          const lockedReward = bigMul(reward, 0.75).toString();
          const dailyReward = bigDiv(lockedReward, 180).toString();
          records.push({
            miner,
            cid,
            height,
            hour,
            reward,
            lockedReward,
            dailyReward,
            time,
          });
        }
      });
      page += 1;
    }
  }
}
