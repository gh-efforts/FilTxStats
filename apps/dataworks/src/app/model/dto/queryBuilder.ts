import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';
import { QueryParamDTO } from './base';

export class QueryBuilderDTO extends QueryParamDTO {
  @ApiProperty({
    type: 'string',
    example: `SELECT * FROM miner WHERE miner:=miner`,
    description: 'SQL',
  })
  @Rule(RuleType.string())
  SQL: string;

  @ApiProperty({
    type: 'object',
    example: {
      miner: 'f01155',
    },
    description: 'SQL 字段替换',
  })
  @Rule(RuleType.object().default({}))
  replacements: { [key: string]: any };

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
  where: { [key: string]: any };

  @ApiProperty({
    type: 'boolean',
    example: false,
    description: '是否返回单条数据',
  })
  @Rule(RuleType.boolean().default(false))
  plain: boolean;

  @ApiProperty({
    type: 'string',
    example: 'miner',
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
    description: '返回指定字段',
  })
  @Rule(RuleType.array().items(RuleType.string().required()).default([]))
  fields: string[];

  @ApiProperty({
    type: 'string',
    example: [['sector_size', 'DESC']],
    description: '字段排序',
  })
  @Rule(
    RuleType.alternatives([
      RuleType.string(),
      RuleType.array().items(
        RuleType.array().items(RuleType.string().required())
      ),
    ])
  )
  order: string | string[][];

  @ApiProperty({
    type: 'string',
    example: 'miner',
    description: '字段分组',
  })
  @Rule(RuleType.string().optional())
  group: string;
}
