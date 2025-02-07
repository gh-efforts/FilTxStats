import * as dotenv from 'dotenv';
dotenv.config();

import * as bull from '@midwayjs/bull';
import {
  App,
  Configuration,
  ILifeCycle,
  IMidwayContainer,
  Inject,
  Logger,
} from '@midwayjs/core';
import * as crossDomain from '@midwayjs/cross-domain';
import * as jwt from '@midwayjs/jwt';
import * as koa from '@midwayjs/koa';
import { IMidwayLogger } from '@midwayjs/logger';
import * as redis from '@midwayjs/redis';
import * as sequlize from '@midwayjs/sequelize';
import * as swagger from '@midwayjs/swagger';
import * as validate from '@midwayjs/validate';
import { join } from 'path';

import { AccessLogMiddleware } from './middleware/accessLog';
import { FormatMiddleware } from './middleware/format';
import { RequestIdMiddleware } from './middleware/requestId';
// import { JwtMiddleware } from './middleware/jwt';
import * as dwsEntity from '@dws/entity';
import * as lilyEntity from '@lily/entity';
import * as insightEntity from '@insight/entity';
import { NotFoundFilter } from './filter/notfound';

import * as bullBoard from '@midwayjs/bull-board';
import { SyncInsightMinerService } from './app/service/syncInsightMiner';

const entity = entity => {
  const arr = [];
  Object.keys(entity).map(key => {
    if (new RegExp('Mapping').test(key)) {
      arr.push(entity[key]);
    }
  });
  return arr;
};
@Configuration({
  importConfigs: [join(__dirname, './config')],
  conflictCheck: true,
  imports: [
    crossDomain,
    koa,
    bull,
    bullBoard,
    { component: swagger, enabledEnvironment: ['local'] },
    redis,
    validate,
    sequlize,
    jwt,
    ...entity(dwsEntity),
    ...entity(lilyEntity),
    ...entity(insightEntity),
  ],
})
export class ContainerLifeCycle implements ILifeCycle {
  @App()
  app: koa.Application;
  @Logger()
  readonly logger: IMidwayLogger;
  @Inject()
  syncInsightMinerService: SyncInsightMinerService;

  async onReady(applicationContext: IMidwayContainer): Promise<void> {
    this.app.useMiddleware([
      RequestIdMiddleware,
      AccessLogMiddleware,
      FormatMiddleware,
      // JwtMiddleware,
    ]);
    this.app.useFilter([NotFoundFilter]);

    //初始化事件监听
    this.syncInsightMinerService.initListener();
  }

  async onServerReady(container: IMidwayContainer): Promise<void> {}

  async onStop(): Promise<void> {}
}
