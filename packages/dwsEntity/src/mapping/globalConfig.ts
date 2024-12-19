import { Provide } from '@midwayjs/core';
import * as _ from 'lodash';

import { GlobalConfigEntity } from '@dws/entity';

@Provide()
export class GlobalConfigMapping {
  getModel() {
    return GlobalConfigEntity;
  }
}
