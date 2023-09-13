import axios, { Axios } from 'axios';
import {
  ChainGetTipSetByHeightRes,
  StateMinerSectorCountRes,
} from './interface';
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

      return res.data.result;
    } catch (e) {
      const message = (e as Error).message;

      errorMsg.push(`Lotus Post ${data.method} 方法出错：${message}`);

      if (errorCount >= 5) {
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

  async getStateMinerInfo(miner: string) {
    const method = 'Filecoin.StateMinerInfo';
    const params = [miner, null];

    const res: any = await this._post({
      data: {
        method,
        params,
      },
    });
    return {
      miner,
      sectorsize: res.result.SectorSize,
    };
  }

  async getChainGetTipSetByHeight(height: number) {
    const method = 'Filecoin.ChainGetTipSetByHeight';
    const params = [height, []];

    const res = await this._post<ChainGetTipSetByHeightRes>({
      data: {
        method,
        params,
      },
    });
    return res.Cids;
  }

  async getStateMinerSectorCount(
    miner: string,
    cids: { [key: string]: string }[]
  ) {
    const method = 'Filecoin.StateMinerSectorCount';
    const params = [miner, cids];

    const res = await this._post<StateMinerSectorCountRes>({
      data: {
        method,
        params,
      },
    });

    return {
      miner,
      live: res.Live,
      active: res.Active,
      faulty: res.Faulty,
    };
  }

  async getStateMinerRecoveries(
    miner: string,
    cids: { [key: string]: string }[]
  ) {
    const method = 'Filecoin.StateMinerRecoveries';
    const params = [miner, cids];
    const res = await this._post<Array<number>>({
      data: {
        method,
        params,
      },
    });

    return {
      miner,
      count: res[res.length - 1],
    };
  }
}
