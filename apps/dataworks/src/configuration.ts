import * as dotenv from 'dotenv';
dotenv.config();

import * as bull from '@midwayjs/bull';
import {
  App,
  Configuration,
  ILifeCycle,
  IMidwayContainer,
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
import { NotFoundFilter } from './filter/notfound';

@Configuration({
  importConfigs: [join(__dirname, './config')],
  conflictCheck: true,
  imports: [
    crossDomain,
    koa,
    bull,
    { component: swagger, enabledEnvironment: ['local'] },
    redis,
    validate,
    sequlize,
    jwt,
  ],
})
export class ContainerLifeCycle implements ILifeCycle {
  @App()
  app: koa.Application;
  @Logger()
  readonly logger: IMidwayLogger;

  async onReady(applicationContext: IMidwayContainer): Promise<void> {
    this.app.useMiddleware([
      RequestIdMiddleware,
      AccessLogMiddleware,
      FormatMiddleware,
      // JwtMiddleware,
    ]);
    this.app.useFilter([NotFoundFilter]);
  }

  async onServerReady(container: IMidwayContainer): Promise<void> {}

  async onStop(): Promise<void> {}
}
