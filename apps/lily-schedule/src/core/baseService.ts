import { App, Inject } from '@midwayjs/core';
import { Application, Context } from '@midwayjs/koa';
import { Model } from 'sequelize';
import * as _ from 'lodash';

import RedisUtils from '../app/comm/redis';
import Utils from '../app/comm/utils';

/**
 * SERVICE的基类
 */
export abstract class BaseService<T extends Model> {
  @App()
  protected app: Application;

  @Inject()
  protected ctx: Context;

  abstract mapping;

  @Inject()
  protected redisUtils: RedisUtils;

  @Inject()
  protected utils: Utils;

  returnWhere(params: Partial<T>) {
    const where: Partial<T> = {};
    for (const key in params) {
      if (
        Object.prototype.hasOwnProperty.call(params, key) &&
        !_.isEmpty(params[key])
      ) {
        where[key] = params[key];
      }
    }
    return where;
  }

  async findAndCountAll(
    page: number,
    limit: number,
    where = {}
  ): Promise<{
    rows: T[];
    count: number;
  }> {
    const res = await this.mapping.findAndCountAll(page, limit, where);
    return res;
  }

  async findAll(where: object, options: object = {}): Promise<T[]> {
    const res = await this.mapping.findAll(where, options);
    return res;
  }

  async findOne(where: object): Promise<T> {
    const res = await this.mapping.findOne(where);
    return res;
  }

  async saveNew(param): Promise<T> {
    const res = await this.mapping.saveNew(param);
    return res;
  }

  async modify(param: object, where: object): Promise<number> {
    const res = await this.mapping.modify(param, where);
    return res;
  }

  async destroy(where: object, option: object = {}): Promise<number> {
    const res = await this.mapping.destroy(where, option);
    return res;
  }

  async findByPk(id: number): Promise<T> {
    const res = await this.mapping.findByPk(id);
    return res;
  }

  async bulkCreate(data, t?): Promise<T[]> {
    const res = await this.mapping.bulkCreate(data, t);
    return res;
  }
}
