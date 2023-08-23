import axios, { Axios } from 'axios';

export class LarkSdk {
  private _instance: Axios;

  constructor() {
    this._instance = axios.create({
      baseURL: process.env.LARK_URL,
      timeout: 1000 * 60 * 2,
    });
  }

  public async larkNotify(message: string) {
    const data = {
      msg_type: 'text',
      content: {
        text: message,
      },
    };

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
      throw new Error(`lark 消息推送 方法出错`);
    }
  }
}
