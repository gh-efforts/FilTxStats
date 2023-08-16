import axios, { Axios } from 'axios';
import { LarkParam } from './interface';

export class LarkSdk {
  private _instance: Axios;

  constructor() {
    this._instance = axios.create({
      baseURL: process.env.larkUrl,
      timeout: 1000 * 60 * 2,
    });
  }

  public async larkNotify(param: LarkParam) {
    const { data } = param;

    try {
      const res = await this._instance.request({
        method: 'POST',
        data,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.status != 200) {
        throw new Error(JSON.stringify(res));
      }

      return res.data;
    } catch (e) {
      console.log(e);
      throw new Error(`lark 消息推送 方法出错`);
    }
  }
}
