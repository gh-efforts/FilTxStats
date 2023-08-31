import { Provide } from '@midwayjs/core';

import { VmMessagesEntity } from '@dws/entity';

@Provide()
export class VmMessagesMapping {
  getModel() {
    return VmMessagesEntity;
  }
}
