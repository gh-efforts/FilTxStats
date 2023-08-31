import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';

export class SubscribeAddressDTO {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
    },
    example: ['f01155'],
    description: '钱包地址',
  })
  @Rule(RuleType.array().items(RuleType.string()).required())
  address: string[];

  @ApiProperty({
    type: 'string',
    example: 'http://127.0.0.1:7001/callback',
    description: '回调地址',
  })
  @Rule(RuleType.string().required())
  callbackUrl: string;
}
