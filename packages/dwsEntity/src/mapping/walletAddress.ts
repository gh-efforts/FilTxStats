import { Provide } from '@midwayjs/core';

import { WalletAddressEntity } from '@dws/entity';

@Provide()
export class WalletAddressMapping {
  getModel() {
    return WalletAddressEntity;
  }
}
