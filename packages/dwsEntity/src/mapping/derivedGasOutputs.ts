import { Provide } from '@midwayjs/core';

import { DerivedGasOutputsEntity } from '@dws/entity';

@Provide()
export class DerivedGasOutputsMapping {
  getModel() {
    return DerivedGasOutputsEntity;
  }
}
