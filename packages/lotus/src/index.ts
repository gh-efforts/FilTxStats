import axios, { Axios } from 'axios';

export class LotusSdk {
  private _instance: Axios;

  /**
   *
   * @param url pixiu访问地址
   */
  constructor(url: string, token: string) {
    this._instance = axios.create({
      baseURL: url,
      timeout: 1000 * 60 * 2,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  private async _post<T>(
    params: any,
    errorMsg: string[] = [],
    errorCount: number = 0
  ): Promise<T> {
    const { data } = params;

    try {
      const res = await this._instance.post(
        '',
        Object.assign(
          {
            jsonrpc: '2.0',
            id: 0,
          },
          data
        )
      );
      if (res.status < 200 || res.status >= 300) {
        throw new Error(JSON.stringify(res));
      }

      return res.data;
    } catch (e) {
      console.log('e', e);
      const message = (e as Error).message;

      errorMsg.push(`Lotus Post ${params.method} 方法出错：${message}`);

      if (errorCount >= 3) {
        throw new Error(JSON.stringify(errorMsg));
      }
      return this._post(params, errorMsg, errorCount + 1);
    }
  }

  async getStateMinerFaults(
    miner: string,
    startHeight: number,
    endHeight: number
  ) {
    const method = 'Filecoin.StateMinerFaults';

    const params = [miner, []];
    return this._post({
      data: {
        method,
        params,
      },
    });
  }
}
