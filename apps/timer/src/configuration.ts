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

import * as dwsEntity from '@dws/entity';
import { NotFoundFilter } from './filter/notfound';
import { AccessLogMiddleware } from './middleware/accessLog';
import { FormatMiddleware } from './middleware/format';
import { JwtMiddleware } from './middleware/jwt';
import { RequestIdMiddleware } from './middleware/requestId';

const entity = () => {
  const arr = [];
  Object.keys(dwsEntity).map(key => {
    if (new RegExp('Mapping').test(key)) {
      arr.push(dwsEntity[key]);
    }
  });
  return arr;
};

console.log(entity());

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
    ...entity(),
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
      JwtMiddleware,
    ]);
    this.app.useFilter([NotFoundFilter]);
  }

  async onServerReady(container: IMidwayContainer): Promise<void> {}

  async onStop(): Promise<void> {}
}
