import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';

export class QueryBuilderDTO {
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
  params: object;
}
