import { Provide } from '@midwayjs/decorator';

import { WalletTypeEntity } from '@dws/entity';

@Provide()
export class WalletTypeMapping {
  getModel() {
    return WalletTypeEntity;
  }
}
