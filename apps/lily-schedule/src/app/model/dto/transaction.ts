import { Rule, RuleType } from '@midwayjs/validate';

export class SyncBaseDTO {
  @Rule(RuleType.array().items(RuleType.string()).optional())
  names: string[] = [];

  @Rule(RuleType.number().integer().optional())
  startHeight?: number;

  @Rule(RuleType.number().integer().optional())
  endHeight?: number;
}

/**
 * 同步交易参数
 * 同步某个地址某一段高度
 */
export interface SyncReqParam {
  targets: ISyncTarget[];
}

export interface ISyncTarget {
  address: string;
  addressId: string;
  startHeight: number;
  endHeight: number;
}

export interface IBruceTaskBody {
  address: string;
  addressId: string;
  startHeight: number;
  endHeight: number;
}

export interface IActorGapFillBody {
  addressId: string;
  startHeight: number;
  endHeight: number;
}
