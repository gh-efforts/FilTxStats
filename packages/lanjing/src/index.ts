import axios, { Axios } from 'axios';
import * as _ from 'lodash';
import type { IAuthInfo, IPost } from './interface';

export class LanJingSdk {
  private _instance: Axios;
  private _authInfo: IAuthInfo;

  /**
   * 蓝鲸接口
   * 带私有token转发请求
   */
  constructor(url: string, authInfo: IAuthInfo) {
    this._authInfo = authInfo;
    this._instance = axios.create({
      baseURL: url,
      timeout: 1000 * 60 * 2,
    });
  }

  /**
   * post 请求
   * 错误上抛
   * @param params
   * @returns
   */
  private async _post<T>(params: IPost): Promise<T> {
    const { url, data } = params;
    console.log('post 请求 body打印:', data);
    const res = await this._instance.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.status < 200 || res.status >= 300) {
      throw new Error(JSON.stringify(res));
    }

    return res.data;
  }

  /**
   * 转发 gh 官网蓝鲸请求
   * @param data
   * @returns
   */
  public async proxyGHHomePage(data: Record<string, any>) {
    return this._post({
      url: '/api/c/compapi/v2/cc/search_inst_by_object/', //限定固定接口请求
      data: {
        ...data,
        ...this._authInfo,
      },
    });
  }
}
