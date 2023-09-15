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

export class SectorSizeDTO {
  @ApiProperty({
    type: 'string',
    example: 'f01155,f01156',
    description: '节点号',
  })
  @Rule(RuleType.string().required())
  miners: string;
}

export class SyncMinerRewardHistoryDTO {
  @Rule(RuleType.array().items(RuleType.string().required()).optional())
  miners: string[];

  @Rule(RuleType.string().optional())
  startAt: string;

  @Rule(RuleType.string().optional())
  endAt: string;

  @Rule(RuleType.boolean().optional())
  isHisiory: boolean;
}

export class SyncMinerTypeDTO {
  @Rule(RuleType.array().items(RuleType.string().required()).optional())
  miners: string[];
}

export class SyncMinerNodeDTO {
  @Rule(RuleType.string().required())
  miner: string;
}
