import { DailyCacheMapping } from '@dws/entity';
import { ILogger, Inject, Logger, Provide } from '@midwayjs/core';
import { SumBalanceGroupHeightDTO, UnitEnum } from '../model/dto/transaction';
import {
  InOutMessageVO,
  ListInOutKey,
  SumBalanceGroupHeightVO,
  SumBalanceKey,
} from '../model/vo/bruce';
import { Op } from 'sequelize';
import { getHeightByTime, getTimeByHeightRaw } from '@dws/utils';
import { BruceService } from './bruceService';
import * as _ from 'lodash';

/**
 * 针对每日计算数据进行缓存
 */
@Provide()
export class DailyCacheService {
  @Inject()
  dailyCacheMapping: DailyCacheMapping;

  @Inject()
  bruceService: BruceService;

  @Logger()
  logger: ILogger;

  private isH1BigH2ByDay(h1: number, h2: number) {
    return getTimeByHeightRaw(h1).isAfter(getTimeByHeightRaw(h2), 'day');
  }

  /**
   * 统计净流入流出
   * 接口有点慢，数据在几十万条的级别
   */
  async listInOutByMessage(
    body: SumBalanceGroupHeightDTO
  ): Promise<InOutMessageVO[]> {
    let { addressId, timeRange, nowHeight, unit } = body;
    const heightRange = [
      getHeightByTime(timeRange[0]),
      getHeightByTime(timeRange[1]),
    ];
    if (!nowHeight) {
      nowHeight = heightRange[1];
    }

    let ret: InOutMessageVO[];
    let dataKey = `${ListInOutKey}_${unit}_${addressId.sort()}`;
    if (unit == UnitEnum.day) {
      this.logger.info(`cache enter, dataKey=%s`, dataKey);

      let cache = await this.dailyCacheMapping.getModel().findAll({
        where: {
          dataKey,
          dataHeight: {
            [Op.between]: heightRange,
          },
        },
        order: [['dataHeight', 'asc']],
      });
      if (_.isEmpty(cache)) {
        this.logger.info(`cache empty, dataKey=%s`, dataKey);
        //没有缓存
        let newRows = await this.bruceService.listInOutByMessage(body);
        await this.setCache<InOutMessageVO>(dataKey, newRows);
        return newRows;
      }

      ret = cache.map(c => c.dataJson as InOutMessageVO);
      //判断高度范围是否有超出，有超出部分走查询,然后和缓存拼接
      let maxCacheHeight = cache[cache.length - 1].dataHeight;
      if (this.isH1BigH2ByDay(heightRange[1], maxCacheHeight)) {
        this.logger.info(
          `cache overrange, dataKey=%s,heightRange=%j,maxCacheHeight=%d`,
          dataKey,
          heightRange,
          maxCacheHeight
        );
        body.heightRange = heightRange;
        body.heightRange[0] = cache[cache.length - 1].dataHeight;
        let newRows = await this.bruceService.listInOutByMessage(body);
        this.logger.info(
          `cache overrange, dataKey=%s,heightRange=%j,newRow=%d`,
          dataKey,
          heightRange,
          newRows && newRows.length
        );
        await this.setCache<InOutMessageVO>(dataKey, newRows);
        ret = ret.concat(newRows);
      }
      this.logger.info(`cache hit, dataKey=%s`, dataKey);
      return ret;
    }

    this.logger.info(`cache other unit, dataKey=%s`, dataKey);
    let newRet = await this.bruceService.listInOutByMessage(body);
    return newRet;
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
    const { timeRange, unit, addressId } = body;
    // 将时间区间转换成高度区间
    const heightRange = [
      getHeightByTime(timeRange[0]),
      getHeightByTime(timeRange[1]),
    ];

    let ret: SumBalanceGroupHeightVO[];
    let dataKey = `${SumBalanceKey}_${unit}_${addressId.sort()}`;
    if (unit == UnitEnum.day) {
      this.logger.info(`cache enter, dataKey=%s`, dataKey);

      let cache = await this.dailyCacheMapping.getModel().findAll({
        where: {
          dataKey,
          dataHeight: {
            [Op.between]: heightRange,
          },
        },
        order: [['dataHeight', 'asc']],
      });
      if (_.isEmpty(cache)) {
        this.logger.info(`cache empty, dataKey=%s`, dataKey);
        //没有缓存
        let newRows = await this.bruceService.sumBalanceGroupHeightByCode(body);
        await this.setCache<SumBalanceGroupHeightVO>(dataKey, newRows);
        return newRows;
      }

      ret = cache.map(c => c.dataJson as SumBalanceGroupHeightVO);
      //判断高度范围是否有超出，有超出全量刷新缓存，因为余额不能仅仅按一天两天增量查询
      let maxCacheHeight = cache[cache.length - 1].dataHeight;
      if (this.isH1BigH2ByDay(heightRange[1], maxCacheHeight)) {
        this.logger.info(
          `cache overrange, dataKey=%s,heightRange=%j,maxCacheHeight=%d`,
          dataKey,
          heightRange,
          maxCacheHeight
        );
        body.heightRange = heightRange;
        let newRows = await this.bruceService.sumBalanceGroupHeightByCode(body);
        this.logger.info(
          `cache overrange, dataKey=%s,heightRange=%j,newRow=%d`,
          dataKey,
          heightRange,
          newRows && newRows.length
        );
        await this.setCache<SumBalanceGroupHeightVO>(dataKey, newRows);
        ret = newRows;
      }
      this.logger.info(`cache hit, dataKey=%s`, dataKey);
      return ret;
    }

    this.logger.info(`cache other unit, dataKey=%s`, dataKey);
    let newRet = await this.bruceService.sumBalanceGroupHeightByCode(body);
    return newRet;
  }

  /**
   * 保存
   * @param dataKey
   * @param data
   */
  async setCache<T>(dataKey: string, dataArr: T[]) {
    if (_.isEmpty(dataArr)) {
      return;
    }
    for (let data of dataArr) {
      let { height } = data as any;
      await this.dailyCacheMapping.getModel().upsert(
        {
          dataKey,
          dataHeight: height,
          dataJson: data,
        },
        {
          fields: ['dataJson'],
        }
      );
    }
  }
}
