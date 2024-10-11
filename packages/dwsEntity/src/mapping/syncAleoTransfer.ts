import { Provide } from '@midwayjs/decorator';
import { SyncAleoTransferEntity } from '../entity/syncGhAleoTransfer';

@Provide()
export class SyncAleoTransferMapping {
  getModel() {
    return SyncAleoTransferEntity;
  }
}
