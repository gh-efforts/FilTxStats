import { ALL, Body, Controller, Inject, Post } from '@midwayjs/core';
import { SubscribeAddressDTO } from '../model/dto/wallet';
import { WalletService } from '../service/wallet';

@Controller('/wallet')
export class WalletController {
  @Inject()
  service: WalletService;

  @Post('/subscribe/address', { summary: '订阅钱包地址交易记录' })
  async subscribeAddress(@Body(ALL) params: SubscribeAddressDTO) {
    return this.service.subscribeAddress(params);
  }
}
