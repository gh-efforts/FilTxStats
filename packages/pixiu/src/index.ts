import axios, { Axios } from 'axios';
import { IGet, MinerBaseRes } from './interface';
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
      }
      return this._get(params, errorMsg, errorCount + 1);
    }
  }

  public async getMinerBaseInfo(minerName: string): Promise<MinerBaseRes[]> {
    const res = await this._get({
      url: '/v2/miner/minerBaseInfo',
      query: {
        minerId: minerName,
      },
    });
    return res.data;
  }
}
