import { MinerEntity, MinerMapping } from '@dws/entity';
import * as bull from '@midwayjs/bull';
import { Inject, Provide } from '@midwayjs/core';
import { BaseService } from '../../core/baseService';
import { SubscribeAddressDTO } from '../model/dto/wallet';

@Provide()
export class WalletService extends BaseService<MinerEntity> {
  @Inject()
  bullFramework: bull.Framework;

  @Inject()
  mapping: MinerMapping;

  async subscribeAddress(params: SubscribeAddressDTO) {}
}
