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
