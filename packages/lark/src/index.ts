import axios, { Axios } from 'axios';
import * as dayjs from 'dayjs';
export class LarkSdk {
  private _instance: Axios;

  constructor() {
    this._instance = axios.create({
      baseURL: process.env.LARK_URL,
      timeout: 1000 * 60 * 2,
    });
  }

  public async larkNotify(data: any) {
    if (process.env.REAL_ENV === 'local') {
      console.log('local 环境不报警');
      return;
    }
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

  public async sendLarkByQueueStatus(
    name: string,
    status: boolean,
    message: string = ''
  ) {
    const arr = [];
    if (message) {
      arr.push(
        {
          tag: 'div',
          text: {
            content: message,
            tag: 'lark_md',
          },
        },
        {
          tag: 'hr',
        }
      );
    }
    const templateLarkMessage = {
      msg_type: 'interactive',
      card: {
        config: {
          wide_screen_mode: true,
        },
        header: {
          template: `${status ? 'green' : 'red'}`,
          title: {
            tag: 'plain_text',
            content: `同步 ${name}: ${status ? '已完成' : '已失败'}`,
          },
        },
        elements: [
          ...arr,
          {
            elements: [
              {
                content: `${status ? '✅' : '❌'}任务执行时间: ${dayjs().format(
                  'YYYY-MM-DD HH:mm:ss'
                )}`,
                tag: 'plain_text',
              },
            ],
            tag: 'note',
          },
        ],
      },
    };

    return this.larkNotify(templateLarkMessage);
  }
}
