import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';

export class RegisterDTO {
  @ApiProperty({
    type: 'string',
    example: 'f01155',
    description: '节点号',
  })
  @Rule(RuleType.string().required())
  miner: string;
}
