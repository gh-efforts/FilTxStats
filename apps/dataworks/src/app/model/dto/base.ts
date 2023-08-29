import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';

export class QueryParamDTO {
  @ApiProperty({
    type: 'integer',
    example: '1',
    description: '页',
  })
  @Rule(RuleType.number().default(1))
  page: number;

  @ApiProperty({
    type: 'integer',
    example: '1',
    description: '条数',
  })
  @Rule(RuleType.number().default(10))
  limit: number;
}
