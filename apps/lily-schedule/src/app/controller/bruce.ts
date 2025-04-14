import {
  ALL,
  Body,
  Controller,
  Get,
  ILogger,
  Inject,
  Logger,
  Post,
  Query,
} from '@midwayjs/core';
import { BruceService } from '../service/bruceService';
import * as bull from '@midwayjs/bull';
import {
  GetMessagesPageDTO,
  SumBalanceGroupHeightDTO,
} from '../model/dto/transaction';
import { RedisService } from '@midwayjs/redis';
import { DailyCacheService } from '../service/dailyCacheService';

@Controller('/f')
export class BruceController {
  @Logger()
  logger: ILogger;

  @Inject()
  bruceService: BruceService;

  @Inject()
  dailyCacheService: DailyCacheService;

  @Inject()
  bullFramework: bull.Framework;

  @Inject()
  private redis: RedisService;

  @Get('/bull/clear')
  async clearBull(@Query('queueName') queueName: string) {
    let queue = await this.bullFramework.ensureQueue(queueName);
    await queue.clean(0);
    //去掉 taskkey
    let taskRKeys = await this.redis.keys('branceBalance:taskHeight:*');
    for (let rk of taskRKeys) {
      await this.redis.del(rk);
    }
    return true;
  }

  @Post('/check/sync/actor/delay')
  async checkActorSyncDelay() {
    await this.bruceService.checkActorSyncDelay();
    return true;
  }

  @Post('/page/messages')
  async getMessagesPage(@Body(ALL) body: GetMessagesPageDTO) {
    let res;
    try {
      res = await this.bruceService.getMessagesPage(body);
    } catch (e) {
      this.logger.warn(e);
    }
    return res;
  }

  @Post('/list/in_out_flow')
  async listInOutFlow(@Body(ALL) body: SumBalanceGroupHeightDTO) {
    let res;
    try {
      // res = await this.bruceService.listInOutByMessage(body);
      res = await this.dailyCacheService.listInOutByMessage(body);
    } catch (e) {
      this.logger.warn(e);
    }
    return res;
  }

  @Post('/sum_balance_group_height')
  async sumBalanceGroupHeightByCode(@Body(ALL) body: SumBalanceGroupHeightDTO) {
    let res;
    try {
      // res = await this.bruceService.sumBalanceGroupHeightByCode(body);
      res = await this.dailyCacheService.sumBalanceGroupHeightByCode(body);
    } catch (e) {
      this.logger.warn(e);
    }
    return res;
  }

  @Post('/monitor_big_messages')
  async monitorBigMessages() {
    let res;
    try {
      res = await this.bruceService.monitorBigMessages();
    } catch (e) {
      this.logger.warn(e);
    }
    return res;
  }

  @Post('/monitor_daily_total')
  async monitorDailyTotal() {
    let res;
    try {
      res = await this.bruceService.monitorDailyTotal();
    } catch (e) {
      this.logger.warn(e);
    }
    return res;
  }
}
