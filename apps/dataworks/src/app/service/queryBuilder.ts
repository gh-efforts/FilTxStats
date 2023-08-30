import { Inject, Provide } from '@midwayjs/core';
import { InjectDataSource } from '@midwayjs/sequelize';
import * as _ from 'lodash';
import * as crypto from 'node:crypto';
import { QueryTypes, Sequelize } from 'sequelize';
import RedisUtils from '../comm/redis';
import { QueryBuilderDTO } from '../model/dto/queryBuilder';

@Provide()
export class QueryBuilderService {
  // 注入自定义数据源
  @InjectDataSource('default')
  dwsSource: Sequelize;

  @Inject()
  redisUtils: RedisUtils;

  camelCase(result: object[] | object): object[] | object {
    if (result instanceof Array) {
      return result.map(item => {
        const obj = {};
        for (const key in item) {
          obj[_.camelCase(key)] = item[key];
        }
        return obj;
      });
    } else {
      const obj = {};
      for (const key in result) {
        obj[_.camelCase(key)] = result[key];
      }
      return obj;
    }
  }

  getColumn(fields: string[]) {
    // 没有传字段返回所有字段 *
    if (!fields.length) {
      return '*';
    }
    return fields
      .map(field => {
        return `${field}`;
      })
      .join(' , ');
  }

  async getQueryCount(SQL: string): Promise<number> {
    const result = (await this.dwsSource.query(
      `SELECT COUNT(*) as count FROM (${SQL}) as query`,
      {
        type: QueryTypes.SELECT,
        plain: true,
      }
    )) as any;
    return Number(result.count);
  }

  getWhere(where: { [key: string]: any }) {
    let arr = [];
    for (const key in where) {
      if (typeof where[key] === 'object') {
        for (const operator in where[key]) {
          arr.push(`${key} ${operator} '${where[key][operator]}'`);
        }
      } else {
        arr.push(`${key} = '${where[key]}'`);
      }
    }
    return arr.join(' AND ');
  }

  getOnlyKey(params: QueryBuilderDTO) {
    const str = JSON.stringify(params);
    const hash = crypto.createHash('md5').update(str);
    return hash.digest('hex');
  }

  async queryBuilder(params: QueryBuilderDTO) {
    const onlyKey = this.getOnlyKey(params);

    const cache = await this.redisUtils.getString(onlyKey);
    if (cache) {
      return JSON.parse(cache);
    }

    const {
      SQL,
      tableName,
      replacements,
      plain,
      fields,
      where,
      page,
      limit,
      group,
    } = params;

    const _SQL = `SELECT ${this.getColumn(fields)} FROM ${tableName} ${
      Object.keys(where).length > 0 ? `WHERE ${this.getWhere(where)}` : ''
    } ${group ? `GROUP BY ${group}` : ''}`;

    const offset = (page - 1) * limit;

    const [count, result] = await Promise.all([
      this.getQueryCount(SQL ? SQL : _SQL),
      this.dwsSource.query(`${SQL ? SQL : _SQL} LIMIT :limit OFFSET :offset`, {
        replacements: {
          ...replacements,
          limit,
          offset,
        },
        plain,
        type: QueryTypes.SELECT,
      }),
    ]);

    const data = this.camelCase(result);

    let _result = data;

    if (!plain) {
      _result = {
        count,
        list: data,
      };
    }

    // 结果不为空，才缓存
    if (!_.isEmpty(data)) {
      await this.redisUtils.setValue(onlyKey, JSON.stringify(_result), 300);
    }

    return _result;
  }
}
