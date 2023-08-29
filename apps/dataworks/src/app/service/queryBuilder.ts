import { Provide } from '@midwayjs/core';
import { InjectDataSource } from '@midwayjs/sequelize';
import * as _ from 'lodash';
import { QueryTypes, Sequelize } from 'sequelize';
import { QueryBuilderDTO } from '../model/dto/queryBuilder';

@Provide()
export class QueryBuilderService {
  // 注入自定义数据源
  @InjectDataSource('default')
  dwsSource: Sequelize;

  camelCase(result: object[] | object) {
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

  async queryBuilder(params: QueryBuilderDTO) {
    const { tableName, replacements, plain, fields, page, limit } = params;

    const SQL = `SELECT ${this.getColumn(fields)} FROM ${tableName}`;

    const offset = (page - 1) * limit;

    const [count, result] = await Promise.all([
      this.getQueryCount(SQL),
      this.dwsSource.query(`${SQL} LIMIT :limit OFFSET :offset`, {
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

    if (!plain) {
      return {
        count,
        list: data,
      };
    }

    return data;
  }
}
