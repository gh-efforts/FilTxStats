import { Controller, Get, Inject } from '@midwayjs/core';
import { FilcoinNetworkService } from '../service/filcoinNetwork';

@Controller('/filcoin')
export class FilcoinController {
  @Inject()
  service: FilcoinNetworkService;

  @Get('/network/data', { summary: 'filcoin 全网数据' })
  async networkData() {
    return this.service.getNetworkData();
  }
}
