import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';
import { QueryParamDTO } from './base';

export class QueryBuilderDTO extends QueryParamDTO {
  @ApiProperty({
    type: 'string',
    example: `SELECT 1`,
    description: 'SQL',
  })
  @Rule(RuleType.string())
  SQL: string;

  @ApiProperty({
    type: 'object',
    example: {
      tableName: 'miner',
      miner: 'f01155',
    },
    description: 'SQL',
  })
  @Rule(RuleType.object().default({}))
  replacements: { [key: string]: unknown } | unknown[];

  @ApiProperty({
    type: 'object',
    example: {
      miner: 'f01155',
      sector_size: {
        '>': 34359738368,
      },
    },
    description: '查询条件',
  })
  @Rule(RuleType.object().default({}))
  where: { [key: string]: unknown };

  @ApiProperty({
    type: 'boolean',
    description: '是否返回单条数据',
  })
  @Rule(RuleType.boolean().default(false))
  plain: boolean;

  @ApiProperty({
    type: 'string',
    description: '表名',
  })
  @Rule(RuleType.string().required())
  tableName: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
    },
    example: ['id', 'miner'],
    description: 'Map returned fields to arbitrary',
  })
  @Rule(RuleType.array().items(RuleType.string().required()).default([]))
  fields: string[];

  @ApiProperty({
    type: 'string',
    example: 'miner',
    description: '字段分组',
  })
  @Rule(RuleType.string().optional())
  group: string;
}
