import { Provide } from '@midwayjs/core';

import { WalletAddressSyncStatusEntity } from '@dws/entity';

@Provide()
export class WalletAddressSyncStatusMapping {
  getModel() {
    return WalletAddressSyncStatusEntity;
  }
}
