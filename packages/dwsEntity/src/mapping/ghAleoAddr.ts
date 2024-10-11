import { Provide } from '@midwayjs/decorator';
import { GhAleoAddrEntity } from '../entity/ghAleoAddr';

@Provide()
export class GhAleoAddrMapping {
  getModel() {
    return GhAleoAddrEntity;
  }
}
