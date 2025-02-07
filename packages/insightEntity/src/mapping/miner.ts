import { Provide, Scope, ScopeEnum } from '@midwayjs/core';
import { MinerEntity } from '@insight/entity';

@Provide()
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export class MinerMapping {
  getModel() {
    return MinerEntity;
  }
}
