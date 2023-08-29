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

  async camelCase(result: object[] | object) {
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

  async queryBuilder(params: QueryBuilderDTO) {
    console.log(params);
    const { SQL, replacements, plain, page, limit } = params;

    console.log('page, limit', page, limit);

    const offset = (page - 1) * limit;

    const result: object[] | object = await this.dwsSource.query(
      `${SQL} LIMIT :limit OFFSET :offset`,
      {
        replacements: {
          ...replacements,
          limit,
          offset,
        },
        plain,
        type: QueryTypes.SELECT,
      }
    );

    const count = await this.dwsSource.query(
      `SELECT COUNT(*) FROM (${SQL}) as query`,
      {
        type: QueryTypes.SELECT,
      }
    );
    console.log('count', count);
    console.log('result', result);

    return this.camelCase(result);
  }
}
