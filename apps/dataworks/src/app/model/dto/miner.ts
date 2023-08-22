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
  miners: string[];
}

export class SyncHisFromFilfoxDTO {
  @Rule(RuleType.string().required())
  miner: string;

  @Rule(RuleType.string().required())
  startAt: string;

  @Rule(RuleType.string().optional())
  endAt: string;
}
