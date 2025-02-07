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
  @Rule(RuleType.array().items(RuleType.string().required()).optional())
  miners: string[];
}

export class SyncTransactionDTO {
  @Rule(RuleType.array().items(RuleType.string()))
  miners: string[];
}

export class UpdateMinerTypeDTO {
  @Rule(RuleType.string().required())
  miner: string;

  @Rule(RuleType.number().integer().valid(1, 2).required())
  dataType: number;

  @Rule(RuleType.number().integer().required())
  typeId: number;

  @Rule(RuleType.number().integer().optional())
  sectorSize: number;
}

export class AddMinerTypeDTO {
  @Rule(RuleType.string().min(1).max(32).required())
  name: string;
}

export class RemoveMinerDTO {
  @Rule(RuleType.string().required())
  miner: string;
}

export class DeadMinerDTO {
  @Rule(RuleType.string().required())
  date: string;
}
