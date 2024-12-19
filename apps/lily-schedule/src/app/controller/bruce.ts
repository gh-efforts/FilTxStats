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
import { SyncReqParam, GetMessagesPageDTO } from '../model/dto/transaction';

@Controller('/f')
export class BruceController {
  @Inject()
  bruceService: BruceService;

  @Inject()
  bullFramework: bull.Framework;

  @Get('/bull/clear')
  async clearBull(@Query('queueName') queueName: string) {
    let queue = await this.bullFramework.ensureQueue(queueName);
    await queue.clean(0);
    return true;
  }

  @Post('/start/actor')
  async startActor(@Body(ALL) body: SyncReqParam) {
    await this.bruceService.startActorBalance(body);
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
}
