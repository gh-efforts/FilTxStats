import { IGas32Data } from '@lily/entity';
import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';
import BigNumber from 'bignumber.js';

export class NetworkByHeightDTO {
  @ApiProperty({
    type: 'number',
    description: 'minHeight',
  })
  @Rule(RuleType.number().required())
  minHeight: number;

  @ApiProperty({
    type: 'number',
    description: 'maxHeight',
  })
  @Rule(RuleType.number().required())
  maxHeight: number;
}

export interface INetworkByHeightVO {
  growTotalRawBytesPower: BigNumber;
  growTotalQaBytesPower: BigNumber;
  totalMinedReward: BigNumber;
  totalPenalty: BigNumber;
  format?: any; // 格式化
}

export class ByTimeRangeDTO {
  @ApiProperty({
    type: 'string',
    description: 'startTime',
  })
  @Rule(RuleType.string().required())
  startTime: string;

  @ApiProperty({
    type: 'string',
    description: 'endTime',
  })
  @Rule(RuleType.string().required())
  endTime: string;
}

export interface Gas32TrimMap {
  preCommitSectorRecords: IGas32Data[];
  proveCommitSectorRecords: IGas32Data[];
  sectorCount: number; //封装扇区数量，每个扇区在这里是 32GB
}
