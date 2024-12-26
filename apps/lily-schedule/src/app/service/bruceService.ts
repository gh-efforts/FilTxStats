import {
  ActorsEntity,
  ExchangeAddressMapping,
  GlobalConfigMapping,
} from '@dws/entity';
import { Config, Init, Inject, Provide, Logger } from '@midwayjs/core';
import * as dayjs from 'dayjs';
import { Op, col, fn } from 'sequelize';
import { BaseService } from '../../core/baseService';
import { ILogger } from '@midwayjs/logger';
import { getHeightByTime, getTimeByHeight, transferFilValue } from '@dws/utils';
import * as bull from '@midwayjs/bull';
import _ = require('lodash');
import {
  IActorGapFillBody,
  IBruceTaskBody,
  ISyncTarget,
  SyncReqParam,
} from '../model/dto/transaction';
import * as dwsentity from '@dws/entity';
import * as lilymessageentity from '@lilymessages/entity';
import { bigMul } from 'happy-node-utils';
import MyError from '../comm/myError';
import BigNumber from 'bignumber.js';

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

  /**
   * 分析交易，拆分任务，放到 bull 队列
   * @returns
   */
  public async startActorBalance(opts: SyncReqParam) {
    let targets: ISyncTarget[] = opts.targets;
    if (_.isEmpty(opts)) {
      //查询交易所地址
      let exchangeAddresses = await this.exchangeAddressMapping
        .getModel()
        .findAll({ raw: true });
      //先查redis 最新结果
      //查询当前最新 actor 高度
      let nowAddrHeight = await this.dwsActorMapping.getModel().findAll({
        attributes: [[fn('max', col('height')), 'maxHeight']],
        where: {
          id: {
            [Op.in]: exchangeAddresses.map(item => item.addressId),
          },
        },
        group: ['id'],
      });
      const nowHeight = getHeightByTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
      //组合最新地址
      targets = [];
      for (let addr of exchangeAddresses) {
        let redisHeight = await this.redisUtils.getString(
          `branceBalance:taskHeight:${addr.addressId}`
        );
        let startHeight = redisHeight ? Number(redisHeight) : 0;
        let dbHeight = 0;
        if (!startHeight) {
          //redis 没有读库
          dbHeight = nowAddrHeight.find(
            addrHeight => addrHeight.addressId === addr.addressId
          )?.maxHeight;
          startHeight = dbHeight;
        }
        this.logger.info(
          `startActorBalance addr:%s,redisH:%s, dbH:%s, startH:%s, nowH:%s`,
          addr.address,
          redisHeight,
          dbHeight,
          startHeight,
          nowHeight
        );
        targets.push({
          addressId: addr.addressId,
          address: addr.address,
          startHeight,
          endHeight: nowHeight,
        });
      }
    }
    this.logger.info(`startActorBalance targets: %j`, targets);

    //将任务推送到queue
    await this.addToTaskQueue(targets, 'bruceBalance');

    //将最新 height 写入 redis，避免正在执行中； 又被调用添加了重复任务，会导致数据错乱
    for (let target of targets) {
      let t = target;
      await this.redisUtils.setValue(
        `branceBalance:taskHeight:${t.addressId}`,
        t.endHeight.toString()
      );
    }

    return true;
  }

  async addToTaskQueue(targets: ISyncTarget[], queueName: string) {
    //将任务推送到queue
    const bullQueue = this.bullFramework.ensureQueue(queueName);

    for (let i = 0, ilen = targets.length; i < ilen; i++) {
      let target = targets[i];

      let { endHeight, startHeight, addressId } = target;
      //按照 500 分页
      const len = Math.ceil((endHeight - startHeight) / 500);

      for (let i = 0; i < len; i++) {
        let starth = i * 500;
        let endh = Math.min(starth + 500, endHeight);
        let jobId = `${addressId}_${starth}_${endh}`;

        let param = {
          startHeight: starth,
          endHeight: endh,
          addressId: target.addressId,
          address: target.address,
          lastPage: i == ilen - 1, //标记最后一页
        };
        await bullQueue.add(param, { priority: endh, jobId }); //高度越高优先级越高
      }
      this.logger.info(`addToTaskQueue完成,%s, %j`, queueName, target);
    });
    return true;
  }

  private async getLastestBalance(
    addressId: string,
    sheight: number
  ): Promise<string> {
    let pre = await this.dwsActorMapping.getModel().findOne({
      where: {
        addressId,
        height: {
          [Op.lt]: sheight,
        },
      },
      order: [['height', 'desc']],
      raw: true,
    });
    if (pre) {
      return pre.balance;
    }
    return null;
  }

  /**
   * 同步lily_actors
   *
   * actor 要 fill，前后页存在关联关系,不能够并发
   * 历史数据（3484079 and 4535279）只能手动导出后，脚本处理转化成 mysql insert导入
   * 4535280之后数据依靠程序同步
   */
  public async syncLilyActors(task: IBruceTaskBody) {
    let { addressId, startHeight, endHeight, address, lastPage } = task;
    let st = Date.now();
    let actors = await this.lilyActorsMapping.getModel().findAll({
      where: {
        id: addressId,
        height: {
          [Op.between]: [startHeight, endHeight],
        },
      },
      order: [['height', 'asc']],
      raw: true,
    });
    this.logger.info(
      `syncLilyActors耗时: %s, %s,%s,%s,len=%d`,
      Date.now() - st,
      address,
      startHeight,
      endHeight,
      (actors && actors.length) || 0
    );

    //为空也不能补，不能确定是 lily 没同步到数据，还是 actor 确实没变化
    if (_.isEmpty(actors)) {
      return;
    }
    let maxHeight = actors[actors.length - 1].height;
    let fillHeight = lastPage ? maxHeight : endHeight;
    this.logger.info(
      `addr:%s,maxHeight:%s, fillheight:%s`,
      address,
      maxHeight,
      fillHeight
    );

    let resultArr = actors.map(ac => {
      return {
        addressId: ac.id,
        address,
        height: ac.height,
        cid: ac.codeCid,
        balance: ac.balance,
        fill: 0, //原始数据
      };
    });
    //填充所有 gap， 到最后一条后不能再填充； 因为后面的数据可能理解改变
    let preb = null;
    for (let i = startHeight; i <= fillHeight; i++) {
      //判断该高度是否有数据
      let matchRow = actors.find(ac => ac.height == i);
      if (matchRow) {
        preb = matchRow.balance;
        continue;
      }
      if (!preb) {
        //需要去库里找最近一条 balance
        let pre = await this.getLastestBalance(addressId, i);
        if (!pre) {
          //库里一条数据没有
          continue;
        }
        preb = pre;
      }
      //没有数据，填充
      resultArr.push({
        addressId,
        address,
        height: i,
        cid: '',
        balance: preb,
        fill: 1, //填充数据
      });
    }
    //先全部写入
    await this.dwsActorMapping.getModel().bulkCreate(resultArr, {
      updateOnDuplicate: ['balance'],
    });
  }

  /**
   * 同步lily_messages
   * @param task
   */
  public async syncLilyMessages(task: IBruceTaskBody) {
    let { address, startHeight, endHeight } = task;
    let messages = await this.lilyMessagesMapping.getModel().findAll({
      where: {
        method: 0,
        [Op.or]: {
          from: address,
          to: address,
        },
        height: {
          [Op.between]: [startHeight, endHeight],
        },
      },
      raw: true,
    });
    await this.dwsMessageMapping.getModel().bulkCreate(
      messages.map(m => {
        return {
          ...m,
        };
      }),
      {
        ignoreDuplicates: true,
      }
    );
  }

  private _getMessagesWhere(param: any = {}) {
    const where: any = {};

    if (_.isEmpty(param)) {
      return where;
    }

    const { heightRange, from, to, method, fromOrTo, gtValue } = param;

    if (heightRange) {
      where.height = {
        [Op.between]: heightRange,
      };
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
   * 如果步长是一天，则返回 height 所在那一天零点的高度值
   * @param height
   * @param heightCycle
   */
  private getStartPointByHeightCycle(height: number, heightCycle: number) {
    let date = dayjs(getTimeByHeight(height)).toDate();
    let ret: number = 0;
    let start: Date = null;
    switch (heightCycle) {
      case 1:
        start = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          date.getHours(),
          date.getMinutes(),
          date.getSeconds()
        );
        break; //秒
      case 2:
        start = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          date.getHours(),
          date.getMinutes()
        );
        break; //分
      case 120:
        start = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          date.getHours()
        );
        break; //时
      case 2880:
        start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        break; //天
      default:
        throw new MyError(`非法刻度, ${heightCycle}`);
    }
    ret = getHeightByTime(start);
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
    nowHeight: number
  ): number[] {
    let ret: number[] = [];
    let maxHeight = Math.min(heightRange[1], nowHeight);
    let minHeight = heightRange[0];
    while (minHeight <= maxHeight) {
      ret.push(this.getStartPointByHeightCycle(minHeight, heightCycle));
      minHeight += heightCycle;
    }
    return ret;
  }

  /**
   * 统计净流入流出
   * 接口有点慢，数据在几十万条的级别
   */
  async listInOutByMessage(
    addressIds: string[],
    timeRange: string[],
    heightCycle: number, //步长
    nowHeight: number //当前高度
  ) {
    const heightRange = [
      getHeightByTime(timeRange[0]),
      getHeightByTime(timeRange[1]),
    ];
    if (!nowHeight) {
      nowHeight = heightRange[1];
    }
    let st = Date.now();
    //直接查出所有数据
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
      let rangeHeight = this.getStartPointByHeightCycle(height, heightCycle);
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
    let kds = this.getKeDuHeights(heightRange, heightCycle, nowHeight);
    let arr = kds.map(kd => {
      return {
        height: kd,
        time: getTimeByHeight(kd),
        in: inMap.get(kd) || '0',
        out: outMap.get(kd) || '0',
      };
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
      if (Number(value) < singleMax) {
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
      getHeightByTime(yesterday + ' 08:00:00'),
      getHeightByTime(today + ' 08:00:00'),
    ];

    // 获取交易所列表
    const exchangeList = await this.exchangeAddressMapping.getExchangeList();

    // 遍历交易所
    let content = '';
    for (const exchange of exchangeList) {
      const [collects, colds] = await Promise.all([
        this.exchangeAddressMapping.getAddressList({ type: 1, exchange }), // 归集钱包
        this.exchangeAddressMapping.getAddressList({ type: 2, exchange }), // 冷钱包
      ]);

      const where = this._getMessagesWhere({
        heightRange,
        fromOrTo: [...collects, ...colds],
        method: [0],
      });

      const messages = await this.lilyMessagesMapping.getModel().findAll({
        where,
        attributes: ['cid', 'height', 'from', 'to', 'method', 'value'],
      });

      // 遍历message
      let totalValue = '0';
      for (const message of messages) {
        const { from, to } = message;

        // 如果from是归集钱包，to是冷钱包，就跳过
        if (collects.includes(from) && colds.includes(to)) {
          continue;
        }

        // 统计净值
        totalValue = bigAdd(totalValue, message.value).toString();
      }

      // 如果净值超过dailyTotal，则加入content
      const valueFil = transferFilValue(totalValue);
      if (Number(valueFil) < dailyTotal) {
        continue;
      }

      content += `${exchange} 净值增量 ${bigMul(valueFil, 1).toFormat(0, {
        decimalSeparator: '.',
        groupSeparator: ',',
        groupSize: 3,
      })} FIL\n`;
    }

    this.logger.info(
      `每日净值增量提醒, 当前时间: ${today}, 高度区间: ${heightRange}, content 内容: ${content}, webhook: ${this.larkConfig.larkToBruceUrl}`
    );

    if (content) {
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
}
