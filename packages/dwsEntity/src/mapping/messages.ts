import { Provide } from '@midwayjs/core';

import { MessagesEntity } from '@dws/entity';

@Provide()
export class MessagesMapping {
  getModel() {
    return MessagesEntity;
  }
}
