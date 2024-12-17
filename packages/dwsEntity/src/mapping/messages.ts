import { Provide } from '@midwayjs/core';
import * as _ from 'lodash';

import { MessagesEntity } from '@dws/entity';

@Provide()
export class MessagesMapping {
  getModel() {
    return MessagesEntity;
  }
}
