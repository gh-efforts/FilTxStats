import { Config, Singleton, HttpClient } from '@midwayjs/core';
import * as dayjs from 'dayjs';
import { bigDiv } from 'happy-node-utils';
import { isString } from 'lodash';

@Singleton()
class Utils {
  @Config('timeAndHeight')
  private timeAndHeight: { time: string; height: number };

  // 转换fil的金额
  public transferFilValue(
    value: string | number,
    format: number = 1e18
  ): string {
    return bigDiv(value, format).toString();
  }

  // 判断是否为短地址，如果是则返回该值
  public returnName(addr: string | null): string {
    return isString(addr) && addr.startsWith('f0') ? addr : '';
  }

  // 判断是否为长地址，如果是则返回该值
  public returnRobustAddress(addr: string): string {
    return isString(addr) && !addr.startsWith('f0') ? addr : '';
  }

  // 平均分割数组
  public splitArray<T>(baseArray: any[], n: number): T[][] {
    let length = baseArray.length;
    let sliceNum = length % n === 0 ? length / n : Math.floor(length / n + 1);
    let res = [];
    for (let i = 0; i < length; i += sliceNum) {
      let arr = baseArray.slice(i, i + sliceNum);
      res.push(arr);
    }
    return res;
  }

  // 根据高度获取对应时间
  public getTimeByHeight(
    height: number,
    format: string = 'YYYY-MM-DD HH:mm:ss'
  ): string {
    const timeStr = dayjs(this.timeAndHeight.time)
      .add((height - this.timeAndHeight.height) * 30, 'second')
      .format(format);
    return timeStr;
  }

  // 根据时间获取对应高度
  public getHeightByTime(timeStr: string) {
    const height =
      Math.floor(
        dayjs(timeStr).diff(dayjs(this.timeAndHeight.time), 'second') / 30
      ) + this.timeAndHeight.height;
    return height;
  }

  public async httpRequest(
    {
      url,
      method,
      data,
      options = {},
    }: {
      url: string;
      method: 'POST' | 'GET';
      data?: any;
      options?: any;
    },
    retries = 3
  ) {
    const httpClient = new HttpClient();

    for (let i = 0; i < retries; i++) {
      try {
        const result = await httpClient.request(url, {
          method,
          data,
          dataType: 'json',
          contentType: 'json', // 发送的 post 为 json
          ...options,
        });
        return result;
      } catch (error) {
        // 判断是否为EAI_AGAIN错误，如果是则进行重试
        if (error.message.includes('EAI_AGAIN') && i < retries - 1) {
          // 等待2s
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }

        throw error; // 达到最大重试次数，抛出错误
      }
    }
  }
}

export default Utils;
