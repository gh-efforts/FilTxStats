import { Init, Inject, Provide, Logger } from '@midwayjs/core';
import {
  GhAleoAddrMapping,
  SyncAleoTransferEntity,
  SyncAleoTransferMapping,
} from '@dws/entity';
import { BaseService } from '../../core/baseService';
import { ILogger } from '@midwayjs/logger';
import { isEmpty } from 'lodash';
import axios, { Axios } from 'axios';
import MyError from '../comm/myError';
import { Op } from 'sequelize';
import * as dayjs from 'dayjs';

@Provide()
export class SyncGhAleoTransferService extends BaseService<SyncAleoTransferEntity> {
  @Inject()
  mapping: SyncAleoTransferMapping;

  @Inject()
  ghAleoAddrMapping: GhAleoAddrMapping;

  @Logger()
  logger: ILogger;

  private _axios: Axios;

  @Init()
  async initMethod() {
    this._axios = axios.create({
      timeout: 1000 * 60 * 2,
    });
  }

  /**
   * 获得库里最近一条 transfer
   * @param addr
   */
  private async getLastestTransfer(addr: string) {
    let ret = await this.mapping.getModel().findOne({
      where: {
        [Op.or]: {
          from: addr,
          to: addr,
        },
      },
      order: [['timestamp', 'desc']],
    });
    return ret;
  }

  /**
   * 开始页面page = 0
   * 整体时间逆序，往前爬，爬到没有数据，或者时间和已有最新数据重叠为止
   * @param addr
   * @param page
   * @param pageSize
   * @returns
   */
  private async syncByAddr(
    addr: string,
    page: number = 0,
    pageSize: number = 50
  ): Promise<{ timeOverlap?: boolean; noMore?: boolean }> {
    this.logger.info(`syncByAddr开始, %s, %s`, addr, page);
    let url = `https://mainnet.aleo123.io/api/v5/mainnet/transactions/transfer/public_transfers/${addr}?page=${page}&page_size=${pageSize}`;
    let ret = await this._axios.get(url);
    if (ret.status != 200) {
      throw new MyError(`ReqErr, ${url}, ${ret.status}`, 500, [], 4);
    }
    let { success, Transfers, message } = ret.data;
    if (!success) {
      throw new MyError(`ReqErr, ${url},${success},${message}`, 500, [], 4);
    }
    if (isEmpty(Transfers)) {
      //无数据，没必要继续爬了
      return { noMore: true };
    }

    let istimeOverlap = false;
    let dbLastestOne = await this.getLastestTransfer(addr);
    let lastOne = Transfers[Transfers.length - 1];
    if (
      dbLastestOne &&
      lastOne.timestamp <= dayjs(dbLastestOne.timestamp).valueOf()
    ) {
      //时间出现重叠，没必要继续爬了
      istimeOverlap = true;
    }

    await this.mapping.getModel().bulkCreate(
      Transfers.map(t => {
        return {
          ...t,
          timestamp: new Date(t.timestamp * 1000),
        };
      }),
      { updateOnDuplicate: ['value'] }
    );

    return { timeOverlap: istimeOverlap };
  }

  /**
   * 同步 aleo，主方法
   */
  public async syncAleo() {
    let addrs = await this.ghAleoAddrMapping
      .getModel()
      .findAll({ attributes: ['addr'] });
    if (isEmpty(addrs)) {
      throw new MyError(`GhAleoAddrEmpty`, 500, [], 4);
    }

    for (let addr of addrs) {
      let shouldContinue = true;
      let page = 0;
      let pageSize = 50;
      let tryCount = 0; //爬取次数
      while (shouldContinue && tryCount < 10) {
        tryCount++;
        let ret = await this.syncByAddr(addr.addr, page, pageSize);
        this.logger.info(`syncByAddr结果, %s, %s, %j`, addr.addr, page, ret);
        if (ret.noMore || ret.timeOverlap) {
          shouldContinue = false;
        } else {
          page++;
        }
      }
    }
  }
}
