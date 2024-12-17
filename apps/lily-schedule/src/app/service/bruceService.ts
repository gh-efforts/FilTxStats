import { ActorsEntity, ExchangeAddressMapping } from '@dws/entity';
import { Config, Init, Inject, Provide, Logger } from '@midwayjs/core';
import * as dayjs from 'dayjs';
import { Op, col, fn } from 'sequelize';
import { BaseService } from '../../core/baseService';
import { ILogger } from '@midwayjs/logger';
import { getHeightByTime } from '@dws/utils';
import * as bull from '@midwayjs/bull';
import _ = require('lodash');
import {
  IActorGapFillBody,
  IBruceTaskBody,
  ISyncTarget,
  SyncReqParam,
} from '../model/dto/transaction';
import * as dwsentity from '@dws/entity';
import * as lilyentity from '@lily/entity';

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

  @Config('lotusConfig')
  lotusConfig: {
    url: string;
    token: string;
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
      const oneYearAgoHeight = getHeightByTime('2023-12-17 00:00:00');
      const nowHeight = getHeightByTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
      //组合最新地址
      targets = exchangeAddresses.map(addr => {
        return {
          addressId: addr.addressId,
          address: addr.address,
          startHeight:
            nowAddrHeight.find(
              addrHeight => addrHeight.addressId === addr.addressId
            )?.maxHeight || oneYearAgoHeight,
          endHeight: nowHeight,
        };
      });
    }
    this.logger.info(`syncActorBalance: %j`, targets);

    //将任务推送到queue
    await this.addToTaskQueue(targets, 'bruceBalance');

    return true;
  }

  async addToTaskQueue(targets: ISyncTarget[], queueName: string) {
    //将任务推送到queue
    const bullQueue = this.bullFramework.ensureQueue(queueName);

    targets.forEach(async target => {
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
        };
        bullQueue.add(param, { priority: 1, jobId });
      }
      this.logger.info(`addToTaskQueue完成,%s, %j`, queueName, target);
    });
    return true;
  }

  /**
   * 分析交易，拆分任务，放到 bull 队列
   * @returns
   */
  public async startMessages(opts: SyncReqParam) {
    let targets: ISyncTarget[] = opts.targets;
    if (_.isEmpty(opts)) {
      //查询交易所地址
      let exchangeAddresses = await this.exchangeAddressMapping
        .getModel()
        .findAll({ raw: true });
      let maxHeightMap: Map<string, number> = new Map();
      for (let addr of exchangeAddresses) {
        //查询当前最新 actor 高度
        let nowOneMax = await this.dwsMessageMapping.getModel().findOne({
          attributes: ['height'],
          where: {
            [Op.or]: {
              from: {
                [Op.in]: addr.address,
              },
              to: {
                [Op.in]: addr.address,
              },
            },
          },
          order: [['height', 'desc']],
          raw: true,
        });
        maxHeightMap.set(addr.address, nowOneMax.height);
      }

      const oneYearAgoHeight = getHeightByTime('2023-12-17 00:00:00');
      const nowHeight = getHeightByTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
      //组合最新地址
      targets = exchangeAddresses.map(addr => {
        return {
          addressId: addr.addressId,
          address: addr.address,
          startHeight: maxHeightMap.get(addr.address) || oneYearAgoHeight,
          endHeight: nowHeight,
        };
      });
    }
    this.logger.info(`syncMessages: %j`, targets);

    //将任务推送到queue
    await this.addToTaskQueue(targets, 'bruceTransaction');

    return true;
  }

  /**
   * 同步lily_actors
   */
  public async syncLilyActors(task: IBruceTaskBody) {
    let { addressId, startHeight, endHeight } = task;
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
    if (_.isEmpty(actors)) {
      return;
    }
    //先全部写入
    await this.dwsActorMapping.getModel().bulkCreate(
      actors.map(ac => {
        return {
          ...ac,
        };
      }),
      {
        updateOnDuplicate: ['balance'],
      }
    );
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
}
