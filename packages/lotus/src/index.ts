import axios, { Axios } from 'axios';
import {
  ChainGetTipSetByHeightRes,
  IChainGetMessageRes,
  IStateDecodeParamsRes,
  IStateGetActorRes,
  IStateMinerInfoRes,
  IStateMinerPowerRes,
  IStateReadStateRes,
  StateMinerSectorCountRes,
} from './interface';
export class LotusSdk {
  private _instance: Axios;

  /**
   *
   * @param url pixiu访问地址
   */
  constructor(url: string, token: string) {
    console.log('url', url);
    console.log('token', token);
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
      const res = await this._instance.request({
        method: 'POST',
        data: Object.assign(
          {
            jsonrpc: '2.0',
            id: 0,
          },
          data
        ),
      });
      if (res.status < 200 || res.status >= 300) {
        throw new Error(JSON.stringify(res));
      }

      return res.data.result;
    } catch (e: any) {
      console.log('e', e.response.data);
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
      sectorsize: res.SectorSize,
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

  /**
   * stateMinerAvailableBalance
   */
  public async stateMinerAvailableBalance(minerName: string) {
    const res = await this._post<string>({
      data: {
        method: 'Filecoin.StateMinerAvailableBalance',
        params: [minerName, null],
      },
    });
    return res;
  }

  /**
   * StateReadState
   */
  public async stateReadState(minerName: string): Promise<IStateReadStateRes> {
    const res = await this._post<IStateReadStateRes>({
      data: {
        method: 'Filecoin.StateReadState',
        params: [minerName, null],
      },
    });
    return res;
  }

  /**
   * StateMinerPower
   */
  public async stateMinerPower(minerName: string, cids: Object[] | null) {
    const res = await this._post<IStateMinerPowerRes>({
      data: {
        method: 'Filecoin.StateMinerPower',
        params: [minerName, cids],
      },
    });
    return res;
  }
  /**
   * StateGetActor
   */
  public async stateGetActor(minerName: string) {
    const res = await this._post<IStateGetActorRes>({
      data: {
        method: 'Filecoin.StateGetActor',
        params: [minerName, null],
      },
    });
    return res;
  }

  /**
   * StateMinerInfo
   */
  public async stateMinerInfo(minerName: string) {
    const res = await this._post<IStateMinerInfoRes>({
      data: {
        method: 'Filecoin.StateMinerInfo',
        params: [minerName, null],
      },
    });
    return res;
  }

  /**
   * StateLookupRobustAddress
   */
  public async stateLookupRobustAddress(id: string) {
    const res = await this._post<string>({
      data: {
        method: 'Filecoin.StateLookupRobustAddress',
        params: [id, null],
      },
    });

    return {
      name: id,
      robustAddress: res,
    };
  }

  /**
   * stateLookupID
   */
  public async stateLookupID(robustAddress: string) {
    const res = await this._post<string>({
      data: {
        method: 'Filecoin.StateLookupID',
        params: [robustAddress, null],
      },
    });
    return {
      name: res || 'f0',
      robustAddress,
    };
  }

  /**
   * StateDecodeParams
   */
  public async stateDecodeParams(minerName: string, params: string) {
    const res = await this._post<IStateDecodeParamsRes>({
      data: {
        method: 'Filecoin.StateDecodeParams',
        params: [minerName, 3, params, null],
      },
    });
    return {
      controlAddrs: res.NewControlAddrs,
      worker: res.NewWorker,
    };
  }

  /**
   * StateDecodeParams
   */
  public async chainGetMessage(cid: string): Promise<IChainGetMessageRes> {
    const res = await this._post<IChainGetMessageRes>({
      data: {
        method: 'Filecoin.ChainGetMessage',
        params: [{ '/': cid }],
      },
    });
    return res;
  }
}
