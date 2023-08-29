import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';
import { QueryParamDTO } from './base';

export class QueryBuilderDTO extends QueryParamDTO {
  @ApiProperty({
    type: 'string',
    example: `SELECT 1`,
    description: 'SQL',
  })
  @Rule(RuleType.string().required())
  SQL: string;

  @ApiProperty({
    type: 'object',
    example: {
      tableName: 'miner',
      miner: 'f01155',
    },
    description: 'SQL',
  })
  @Rule(RuleType.object().required())
  replacements: { [key: string]: unknown } | unknown[];

  @ApiProperty({
    type: 'boolean',
    description: '是否返回单条数据',
  })
  @Rule(RuleType.boolean().required())
  plain: boolean;
}
