import {
  ALL,
  Body,
  Controller,
  ILogger,
  Inject,
  Logger,
  Post,
} from "@midwayjs/core";
import { BruceService } from "../service/bruceService";
import {
  GetMessagesPageDTO,
  SumBalanceGroupHeightDTO,
} from "../model/dto/transaction";
import { DailyCacheService } from "../service/dailyCacheService";

@Controller("/f")
export class BruceController {
  @Logger()
  logger: ILogger;

  @Inject()
  bruceService: BruceService;

  @Inject()
  dailyCacheService: DailyCacheService;

  @Post("/check/sync/actor/delay")
  async checkActorSyncDelay() {
    await this.bruceService.checkActorSyncDelay();
    return true;
  }

  @Post("/page/messages")
  async getMessagesPage(@Body(ALL) body: GetMessagesPageDTO) {
    let res;
    try {
      res = await this.bruceService.getMessagesPage(body);
    } catch (e) {
      this.logger.warn(e);
    }
    return res;
  }

  @Post("/list/in_out_flow")
  async listInOutFlow(@Body(ALL) body: SumBalanceGroupHeightDTO) {
    let res;
    try {
      res = await this.dailyCacheService.listInOutByMessage(body);
    } catch (e) {
      this.logger.warn(e);
    }
    return res;
  }

  @Post("/sum_balance_group_height")
  async sumBalanceGroupHeightByCode(@Body(ALL) body: SumBalanceGroupHeightDTO) {
    let res;
    try {
      res = await this.dailyCacheService.sumBalanceGroupHeightByCode(body);
    } catch (e) {
      this.logger.warn(e);
    }
    return res;
  }

  @Post("/monitor_big_messages")
  async monitorBigMessages() {
    let res;
    try {
      res = await this.bruceService.monitorBigMessages();
    } catch (e) {
      this.logger.warn(e);
    }
    return res;
  }

  @Post("/monitor_daily_total")
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
