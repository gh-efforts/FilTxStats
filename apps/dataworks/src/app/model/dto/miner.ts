import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';

export class RegisterDTO {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
    },
    example: ['f01155'],
    description: '节点号',
  })
  @Rule(RuleType.array().items(RuleType.string()).required())
  miner: string[];
}
