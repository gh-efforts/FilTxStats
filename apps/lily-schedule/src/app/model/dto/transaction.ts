import { Rule, RuleType } from '@midwayjs/validate';
import { QueryParamDTO } from './base';

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

export class GetMessagesPageDTO extends QueryParamDTO {
  @Rule(
    RuleType.array().items(RuleType.number().integer()).length(2).required()
  )
  heightRange: number[];

  @Rule(RuleType.array().items(RuleType.string()).min(1).optional())
  from: string[];

  @Rule(RuleType.array().items(RuleType.string()).min(1).optional())
  to: string[];

  @Rule(RuleType.array().items(RuleType.number().integer()).min(1).optional())
  method: number[];

  @Rule(RuleType.array().items(RuleType.string()).min(1).optional())
  fromOrTo: string[];
}
