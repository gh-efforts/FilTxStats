import {
  ALL,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
} from '@midwayjs/core';
import { BruceService } from '../service/bruceService';
import * as bull from '@midwayjs/bull';
import {
  SyncReqParam,
  GetMessagesPageDTO,
  SumBalanceGroupHeightDTO,
} from '../model/dto/transaction';
import { RedisService } from '@midwayjs/redis';

@Controller('/f')
export class BruceController {
  @Inject()
  bruceService: BruceService;

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

  @Post('/start/actor')
  async startActor(@Body(ALL) body: SyncReqParam) {
    await this.bruceService.startActorBalance(body);
    return true;
  }

  @Post('/check/sync/actor/delay')
  async checkActorSyncDelay() {
    await this.bruceService.checkActorSyncDelay();
    return true;
  }

  // @Post('/start/message')
  // async startMessage(@Body(ALL) body: SyncReqParam) {
  //   await this.bruceService.startMessages(body);
  //   return true;
  // }

  @Post('/page/messages')
  async getMessagesPage(@Body(ALL) body: GetMessagesPageDTO) {
    const res = await this.bruceService.getMessagesPage(body);
    return res;
  }

  @Post('/list/in_out_flow')
  async listInOutFlow(@Body(ALL) body: SumBalanceGroupHeightDTO) {
    const res = await this.bruceService.listInOutByMessage(
      body.addressId,
      body.timeRange,
      body.heightCycle,
      body.nowHeight
    );
    return res;
  }

  @Post('/monitor_big_messages')
  async monitorBigMessages() {
    const res = await this.bruceService.monitorBigMessages();
    return res;
  }

  @Post('/monitor_daily_total')
  async monitorDailyTotal() {
    const res = await this.bruceService.monitorDailyTotal();
    return res;
  }

  @Get('/test/calculate/jing', {
    summary: '测试用，计算某个高度范围内净流入量',
  })
  async calInOutByRange(
    @Query('sh') sh: number,
    @Query('eh') eh: number,
    @Query('addrstr') addstr: string
  ) {
    return await this.bruceService.calInOutByRange(sh, eh, addstr.split(','));
  }
}
