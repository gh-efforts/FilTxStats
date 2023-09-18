import { Rule, RuleType } from '@midwayjs/validate';

export class SyncBaseDTO {
  @Rule(RuleType.array().items(RuleType.string()).optional())
  names: string[] = [];

  @Rule(RuleType.number().integer().optional())
  startHeight?: number;

  @Rule(RuleType.number().integer().optional())
  endHeight?: number;
}
