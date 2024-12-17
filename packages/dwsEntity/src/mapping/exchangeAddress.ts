import { Provide } from '@midwayjs/core';

import { ExchangeAddressEntity } from '@dws/entity';

@Provide()
export class ExchangeAddressMapping {
  getModel() {
    return ExchangeAddressEntity;
  }
}
