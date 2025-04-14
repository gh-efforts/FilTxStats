import {
  ActorsEntity,
  ExchangeAddressMapping,
  GlobalConfigMapping,
} from '@dws/entity';
import { Config, Init, Inject, Provide, Logger } from '@midwayjs/core';
import * as dayjs from 'dayjs';
import { Op } from 'sequelize';
import { BaseService } from '../../core/baseService';
import { ILogger } from '@midwayjs/logger';
import {
  getHeightByTime,
  getTimeByHeight,
  getTimeByHeightRaw,
  transferFilValue,
} from '@dws/utils';
import * as bull from '@midwayjs/bull';
import _ = require('lodash');
import { SumBalanceGroupHeightDTO, UnitEnum } from '../model/dto/transaction';
import * as dwsentity from '@dws/entity';
import * as lilymessageentity from '@lilymessages/entity';
import { bigMul, bigAdd } from 'happy-node-utils';
import MyError from '../comm/myError';
import BigNumber from 'bignumber.js';
import { LilyMessagesMapping } from '../mapping/lilyMessages';

import * as utc from 'dayjs/plugin/utc';
import { InOutMessageVO, SumBalanceGroupHeightVO } from '../model/vo/bruce';
dayjs.extend(utc);

@Provide()
export class BruceService extends BaseService<ActorsEntity> {
  @Inject()
  mapping: lilyentity.ActorsMapping;

  @Inject()
  exchangeAddressMapping: ExchangeAddressMapping;

  @Inject()
  dwsActorMapping: dwsentity.ActorsMapping;

  @Inject()
  dwsMessageMapping: dwsentity.MessagesMapping;

  @Inject()
  lilyActorsMapping: lilyentity.ActorsMapping;

  @Inject()
  lilyMessagesMapping: lilyentity.MessagesMapping;

  @Inject()
  bullFramework: bull.Framework;

  @Inject()
  globalConfigMapping: GlobalConfigMapping;

  @Inject()
  lilyMapping: LilyMessagesMapping;

  @Config('lotusConfig')
  lotusConfig: {
    url: string;
    token: string;
  };

  @Config('larkConfig')
  larkConfig: {
    larkToBruceUrl: string;
  };

  @Logger()
  logger: ILogger;

  @Init()
  async initMethod() {}

  // 获取utc时间对应的高度
  private _getHeightByUtcTime(timeStr: string | Date) {
    const height =
      Math.floor(
        dayjs(timeStr).diff(dayjs('2023-01-01 00:00:00'), 'second') / 30
      ) + 2474160;
    return height;
  }

  // 获取高度对应的utc时间
  _getUtcTimeByHeight(
    height: number,
    format: string = 'YYYY-MM-DD HH:mm:ss'
  ): string {
    const timeStr = this._getUtcTimeByHeightRaw(height).format(format);
    return timeStr;
  }
  private _getUtcTimeByHeightRaw(height: number): dayjs.Dayjs {
    const timeStr = dayjs('2023-01-01 00:00:00').add(
      (height - 2474160) * 30,
      'second'
    );
    return timeStr;
  }

  /**
   * 同步 actor 落后很多高度就报警
   * 说明同步出现问题
   */
  public async checkActorSyncDelay() {
    const maxHeight = await this.lilyActorsMapping.getModel().findOne({
      attributes: ['addressId', 'height'],
      order: [['height', 'desc']],
      raw: true,
    });
    const nowHeight = getHeightByTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
    this.logger.info(
      'checkActorSyncDelay, maxHeight:%s, nowHeight:%s',
      nowHeight,
      maxHeight.height
    );
    if (nowHeight - maxHeight.height > 1 * 2 * 60 * 3) {
      //2小时没更新
      throw new MyError(`syncActorSyncDelay lily 同步 actor 落后很多高度`);
    }
    return true;
  }

  private _getMessagesWhere(param: any = {}) {
    const where: any = {};

    if (_.isEmpty(param)) {
      return where;
    }

    const { heightRange, from, to, method, fromOrTo, gtValue, cid } = param;

    if (heightRange) {
      where.height = {
        [Op.between]: heightRange,
      };
    }

    if (cid) {
      where.cid = cid;
    }

    if (from) {
      where.from = from;
    }

    if (to) {
      where.to = to;
    }

    if (method) {
      where.method = method;
    }

    if (gtValue) {
      where.value = {
        [Op.gt]: bigMul(gtValue, 1e18).toString(),
      };
    }

    if (fromOrTo) {
      where[Op.or] = {
        from: fromOrTo,
        to: fromOrTo,
      };
    }

    return where;
  }

  /**
   * 将高度归属到某个时间区间
   * 如果步长是一天，则查询前一天8点到后一天8点的数据
   * 如果步长要支持随意值； 实际必须要有固定点，否则每时每刻看历史数据都在变化。
  现在需要对时间进行区域划分，入参是三个：区域划分数量，区域划分单位，一个给定时间戳 t, 规则如下：
  如果单位是秒，分，时； 则将最近一天的 8 点视为固定点，往前往后不断划分；
  如果单位是天；则将最近一个月的第一天 8 点作为固定点，往前往后不断划分；
  要求计算出 t 所归属的时间区域的起点，性能要好
  给出 js 代码
   
   * @param height
   * @param heightCycle
   */
  private getStartPointByHeightCycle(
    height: number,
    heightCycle: number,
    unit: string,
    isUtc = false
  ) {
    let hd = isUtc
      ? this._getUtcTimeByHeightRaw(height)
      : getTimeByHeightRaw(height);
    let timestamp = hd.toDate(); //JavaScript 的 Date 对象本身没有内置的时区概念。它内部存储的是一个 UTC 时间戳,时区的概念主要在将 Date 对象转换为字符串时体现，因为转换过程会根据运行环境的本地时区设置进行调整
    let ret: number = 0;

    let fixedPoint;
    // 计算固定点
    if (
      unit == UnitEnum.height ||
      unit == UnitEnum.min ||
      unit == UnitEnum.hour
    ) {
      fixedPoint = new Date(
        timestamp.getFullYear(),
        timestamp.getMonth(),
        timestamp.getDate(),
        0,
        0,
        0,
        0
      );
    } else if (unit === UnitEnum.day) {
      fixedPoint = new Date(
        timestamp.getFullYear(),
        timestamp.getMonth(),
        1,
        0,
        0,
        0,
        0
      );
    } else {
      throw new Error('无效的单位');
    }

    let unitMillis: number;
    let quantity: number; //用户填写的数字
    switch (unit) {
      case UnitEnum.height:
        unitMillis = 1000 * 30;
        quantity = heightCycle;
        break;
      case UnitEnum.min:
        unitMillis = 60 * 1000;
        quantity = heightCycle / 2;
        break;
      case UnitEnum.hour:
        unitMillis = 60 * 60 * 1000;
        quantity = heightCycle / 120;
        break;
      case UnitEnum.day:
        unitMillis = 24 * 60 * 60 * 1000;
        quantity = heightCycle / 2880;
        break;
      default:
        throw new Error('无效的单位');
    }

    // 计算时间差
    const diffMillis = timestamp.getTime() - fixedPoint.getTime();

    // 计算 t 所归属的时间区域的起点, 2024-12-31T16:35:30+08:00 应当归属到2 024-12-32T00:00:00+08:00， 而不是2024-12-31T00:00:00+08:00
    const zoneStart =
      fixedPoint.getTime() +
      Math.ceil(diffMillis / (quantity * unitMillis)) * (quantity * unitMillis);

    if (isUtc) {
      ret = this._getHeightByUtcTime(zoneStart);
    } else {
      ret = getHeightByTime(zoneStart);
    }
    // this.logger.info(
    //   'startPoint: %s, %d, %s, %d',
    //   dayjs(timestamp).format(),
    //   height,
    //   dayjs(zoneStart).format(),
    //   ret
    // );
    return ret;
  }

  /**
   * 获得刻度表
   * @param heightRange
   * @param heightCycle
   * @param nowHeight
   */
  private getKeDuHeights(
    heightRange: number[],
    heightCycle: number,
    nowHeight: number,
    unit: string,
    isUtc = false
  ): number[] {
    let ret: number[] = [];
    let maxHeight = Math.min(heightRange[1], nowHeight);
    let minHeight = heightRange[0];
    while (minHeight <= maxHeight) {
      ret.push(
        this.getStartPointByHeightCycle(minHeight, heightCycle, unit, isUtc)
      );
      minHeight += heightCycle;
    }
    return ret;
  }

  /**
   * 查询所有交易信息
   * from， to 必须用长地址查
   * @param heightRange
   * @param addressIds
   * @returns
   */
  private async _listAllMsg(heightRange: number[], addressIds: string[]) {
    // let sret: any = await this.lilyMapping.query(
    //   `select
    //     "from",
    //     "to",
    //     "value",
    //     "height"
    //   from "dws_shim"."messages"
    //   where "height" between :sh and :eh
    //     and "method" in (:methods)
    //     and ("from" in (:addressIds) or "to" in (:addressIds))
    //   order by height desc
    //   `,
    //   {
    //     sh: heightRange[0],
    //     eh: heightRange[1],
    //     methods: [0, 3844450837],
    //     addressIds: addressIds,
    //   }
    // );
    // let ret: any[] = sret;
    let ret = await this.lilyMessagesMapping.getModel().findAll({
      attributes: ['from', 'to', 'value', 'height'],
      where: {
        height: {
          [Op.between]: heightRange,
        },
        method: [0, 3844450837],
        [Op.or]: {
          from: addressIds,
          to: addressIds,
        },
      },
      order: [['height', 'desc']],
      raw: true,
    });
    return ret;
  }

  /**
   * 统计净流入流出
   * 接口有点慢，数据在几十万条的级别
   */
  async listInOutByMessage(
    body: SumBalanceGroupHeightDTO
  ): Promise<InOutMessageVO[]> {
    let addressIds = body.addressId;
    let timeRange = body.timeRange;
    let heightCycle = body.heightCycle; //步长
    let nowHeight = body.nowHeight; //当前高度
    let unit = body.unit;

    const heightRange = body.heightRange || [
      getHeightByTime(timeRange[0]),
      getHeightByTime(timeRange[1]),
    ];
    if (!nowHeight) {
      nowHeight = heightRange[1];
    }
    let st = Date.now();
    //直接查出所有数据
    let ret = await this._listAllMsg(heightRange, addressIds);
    if (_.isEmpty(ret)) {
      return [];
    }
    this.logger.info(`listInOutByMessage sql duration: %d`, Date.now() - st);
    st = Date.now();
    //直接累加所有数据
    let inMap: Map<number, BigNumber> = new Map();
    let outMap: Map<number, BigNumber> = new Map();
    let addressSet: Set<string> = new Set(addressIds);

    for (let i = 0, ilen = ret.length; i < ilen; i++) {
      let row = ret[i];
      let height = row.height;
      let value = row.value;
      let from = row.from;
      let to = row.to;
      let rangeHeight = this.getStartPointByHeightCycle(
        height,
        heightCycle,
        unit,
        true
      );
      if (addressSet.has(from) && !addressSet.has(to)) {
        //转出
        let nv = outMap.get(rangeHeight);
        outMap.set(rangeHeight, nv ? nv.plus(value) : new BigNumber(value));
      } else if (!addressSet.has(from) && addressSet.has(to)) {
        //转入
        let nv = inMap.get(rangeHeight);
        inMap.set(rangeHeight, nv ? nv.plus(value) : new BigNumber(value));
      } else {
        //内部转账不计算
        continue;
      }
    }
    //组装结果返回
    let kds = this.getKeDuHeights(
      heightRange,
      heightCycle,
      nowHeight,
      unit,
      true
    );
    let arr = kds
      .filter(kd => {
        return inMap.has(kd) || outMap.has(kd);
      })
      .map(kd => {
        let vo: InOutMessageVO = {
          height: kd,
          time: getTimeByHeight(kd),
          in: inMap.get(kd)?.toNumber() || 0,
          out: outMap.get(kd)?.toNumber() || 0,
        };
        return vo;
      });
    this.logger.info(`listInOutByMessage js duration: %d`, Date.now() - st);
    return arr;
  }

  // 分页查询messages
  async getMessagesPage(param) {
    const { page, limit } = param;

    const offset = (page - 1) * limit;
    const where = this._getMessagesWhere(param);
    const res = await this.lilyMessagesMapping.getModel().findAndCountAll({
      where,
      limit,
      offset: offset > 0 ? offset : 0,
      order: [['height', 'desc']],
      attributes: ['cid', 'height', 'from', 'to', 'method', 'value'],
    });
    return res;
  }

  // 监控大额交易
  async monitorBigMessages() {
    const [config, addressObj] = await Promise.all([
      this.globalConfigMapping
        .getModel()
        .findOne({ where: { name: 'Bruce监控' } }),
      this.exchangeAddressMapping.getObj(),
    ]);

    const {
      singleMax,
      heightDelay,
      heightCycle,
    }: { singleMax: number; heightDelay: number; heightCycle: number } =
      JSON.parse(config.value);

    // 获取当前时间的高度
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const nowHeight = getHeightByTime(now);

    // 计算要查询的高度区间
    const heightRange = [
      nowHeight - heightDelay - heightCycle + 1,
      nowHeight - heightDelay,
    ];

    const addresses = Object.keys(addressObj);
    const where = this._getMessagesWhere({
      heightRange,
      to: addresses,
      method: [0],
    });

    const messages = await this.lilyMessagesMapping
      .getModel()
      .findAll({ where });

    let content = '';
    for (const message of messages) {
      const value = transferFilValue(message.value);

      // 金额没超限制 或 from地址为记录的归集类型地址
      if (Number(value) < singleMax || addressObj[message.from]?.type == 1) {
        continue;
      }

      const { exchange, addressName, address } = addressObj[message.to];

      content += `[${exchange}${addressName}](https://www.filutils.com/zh/account/${address}) [${
        message.cid
      }](https://www.filutils.com/zh/message/${message.cid}) 金额：${bigMul(
        value,
        1
      ).toFormat(0, {
        decimalSeparator: '.',
        groupSeparator: ',',
        groupSize: 3,
      })} FIL\n`;
    }

    this.logger.info(
      `监控大额交易, 当前时间: ${now}, 高度区间: ${heightRange}, 查询结果: ${JSON.stringify(
        messages
      )}, content 内容: ${content}, webhook: ${this.larkConfig.larkToBruceUrl}`
    );

    if (content) {
      this.utils.httpRequest({
        url: this.larkConfig.larkToBruceUrl,
        method: 'POST',
        data: this._larkCardTemplate({
          title: '大额交易流入提醒',
          content,
        }),
      });
    }

    return true;
  }

  /**
   * 测试用，计算某个高度范围内净流入量
   * @param sh
   * @param eh
   * @param addrs  长地址
   */
  public async calInOutByRange(sh: number, eh: number, addrs: string[]) {
    let ret = await this._listAllMsg([sh, eh], addrs);
    let inOutInfo = this._plusInOut(ret, addrs);
    return {
      inOutInfo,
      formatJing: transferFilValue(inOutInfo.jing.toString()),
    };
  }

  /**
   * 累加拆分 in out
   * @param ret
   */
  private _plusInOut(
    ret: lilymessageentity.MessagesEntity[],
    addressArr: string[]
  ) {
    let inv: BigNumber = new BigNumber(0);
    let out: BigNumber = new BigNumber(0);
    let addressSet: Set<string> = new Set(addressArr);
    for (let i = 0, ilen = ret.length; i < ilen; i++) {
      let row = ret[i];
      let value = row.value;
      let from = row.from;
      let to = row.to;
      if (addressSet.has(from) && !addressSet.has(to)) {
        //转出
        out = out.plus(value);
      } else if (!addressSet.has(from) && addressSet.has(to)) {
        //转入
        inv = inv.plus(value);
      } else {
        //内部转账不计算
        continue;
      }
    }
    return {
      in: inv,
      out: out,
      jing: inv.minus(out),
    };
  }

  // 监控每日累计交易
  async monitorDailyTotal() {
    const config = await this.globalConfigMapping
      .getModel()
      .findOne({ where: { name: 'Bruce监控' } });

    const { dailyTotal }: { dailyTotal: number } = JSON.parse(config.value);

    // 获取当前时间的高度
    const today = dayjs().format('YYYY-MM-DD');
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    // 计算要查询的高度区间
    const heightRange = [
      getHeightByTime(yesterday + ' 08:00:01'),
      getHeightByTime(today + ' 08:00:00'),
    ];

    // 获取交易所列表
    const exchangeList = await this.exchangeAddressMapping.getModel().findAll();
    let binanAddrs = exchangeList.filter(e => e.exchange == '币安');
    let okxAddrs = exchangeList.filter(e => e.exchange == 'OKX');
    let allAddr = exchangeList.map(e => e.address);

    //查询交易
    let ret = await this._listAllMsg(heightRange, allAddr);
    let binanJing = this._plusInOut(
      ret,
      binanAddrs.map(e => e.address)
    );
    let okxJing = this._plusInOut(
      ret,
      okxAddrs.map(e => e.address)
    );

    // 遍历交易所
    let content = '';

    // 如果净值超过dailyTotal，则加入content
    const binanFil = transferFilValue(
      binanJing.jing.absoluteValue().toString()
    );
    if (Number(binanFil) >= dailyTotal) {
      content += `币安 净值增量 ${bigMul(
        transferFilValue(binanJing.jing.toString()),
        1
      ).toFormat(0, {
        decimalSeparator: '.',
        groupSeparator: ',',
        groupSize: 3,
      })} FIL\n`;
    }

    const okxFil = transferFilValue(okxJing.jing.absoluteValue().toString());
    if (Number(okxFil) >= dailyTotal) {
      content += `OKX 净值增量 ${bigMul(
        transferFilValue(okxJing.jing.toString()),
        1
      ).toFormat(0, {
        decimalSeparator: '.',
        groupSeparator: ',',
        groupSize: 3,
      })} FIL\n`;
    }

    this.logger.info(
      `北京时间 ${yesterday} 08:00:01 ~ ${today} 08:00:00\n每日净值增量提醒, 当前时间: ${today}, 高度区间: ${heightRange}, content 内容: ${content}, webhook: ${this.larkConfig.larkToBruceUrl}`
    );

    if (content) {
      content =
        `北京时间 ${yesterday} 08:00:01 ~ ${today} 08:00:00\n\n` + content;

      this.utils.httpRequest({
        url: this.larkConfig.larkToBruceUrl,
        method: 'POST',
        data: this._larkCardTemplate({
          title: '每日净值增量提醒',
          content,
        }),
      });
    }

    return true;
  }

  private _larkCardTemplate({ title, template = 'red', content = '' }) {
    const cardTemplate = {
      msg_type: 'interactive',
      card: {
        config: {
          wide_screen_mode: true,
        },
        header: {
          template: template,
          title: {
            tag: 'plain_text',
            content: title,
          },
        },
        elements: [
          {
            tag: 'div',
            text: {
              content: content,
              tag: 'lark_md',
            },
          },
        ],
      },
    };
    return cardTemplate;
  }

  // 获取地址的余额（补足缺失高度的余额）
  private async _getAddressIdBalance(id: string, heightRange: number[]) {
    // 获取高度区间内的actors数据
    let actors: { id; height; balance }[] = await this.lilyMapping.query(
      `SELECT
        "id",
        "height",
        "balance"
      FROM
        "dws_shim"."actors" AS "Actors"
      WHERE
        "Actors"."id" = '${id}'
        AND "Actors"."height" BETWEEN ${heightRange[0]}
        AND ${heightRange[1]}
      ORDER BY
        "Actors"."height" ASC;`,
      {}
    );

    let map: Map<string, string> = new Map();

    if (actors.length === 0) {
      return map;
    }

    if (Number(actors[0].height) !== heightRange[0]) {
      let actor: { id; height; balance }[] = await this.lilyMapping.query(
        `SELECT
          "id",
          "height",
          "balance"
        FROM
          "dws_shim"."actors" AS "Actors"
        WHERE
          "Actors"."id" = '${id}'
          AND "Actors"."height" <= ${heightRange[0]}
        ORDER BY
          "Actors"."height" DESC
        LIMIT 1;`,
        {}
      );

      if (actor.length > 0) {
        actor[0].height = heightRange[0];
        actors.unshift(actor[0]);
      }
    }

    // 补足缺失高度的余额
    for (let index = 0; index < actors.length; index++) {
      let { height, balance, id } = actors[index];
      let next: any = actors[index + 1];

      if (index === actors.length - 1) {
        next = {
          height: heightRange[1],
        };
      }

      height = Number(height);
      while (height <= Number(next.height)) {
        map.set(`${id}_${height}`, balance);

        height++;
      }
    }

    return map;
  }

  /**
   * 查余额
   * 内存中进行数据补齐
   * @param body
   * @returns
   */
  async sumBalanceGroupHeightByCode(
    body: SumBalanceGroupHeightDTO
  ): Promise<SumBalanceGroupHeightVO[]> {
    const { addressId, timeRange, heightCycle, unit } = body;
    // 将时间区间转换成高度区间
    const heightRange = body.heightRange || [
      getHeightByTime(timeRange[0]),
      getHeightByTime(timeRange[1]),
    ];

    // 按照当前高度算出刻度
    let keDus = await this.getKeDuHeights(
      heightRange,
      heightCycle,
      getHeightByTime(dayjs().format('YYYY-MM-DD HH:mm:ss')),
      unit,
      true
    );

    let st = Date.now();
    let allDtMapArr = await Promise.all(
      addressId.map(it => {
        return this._getAddressIdBalance(it, heightRange);
      })
    );
    this.logger.info(
      `sumBalanceGroupHeightByCode sql duration: %d`,
      Date.now() - st
    );

    let allDtMap = allDtMapArr.reduce((acc, curr) => {
      curr.forEach((value, key) => {
        acc.set(key, value); // 如果 key 已存在，则会覆盖
      });
      return acc;
    }, new Map<string, string>());

    let ret = keDus.map(kd => {
      return {
        height: kd,
        balance: addressId.reduce((pre, cur) => {
          const key = `${cur}_${kd}`;
          return bigAdd(pre, allDtMap.get(key) || '0').toString();
        }, '0'),
        time: getTimeByHeight(kd),
      };
    });

    return ret;
  }
}
