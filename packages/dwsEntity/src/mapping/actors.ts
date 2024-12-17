import { Provide } from '@midwayjs/core';

import { ActorsEntity } from '@dws/entity';

@Provide()
export class ActorsMapping {
  getModel() {
    return ActorsEntity;
  }
}
