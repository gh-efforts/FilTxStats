import { Controller, Get, Inject, Param } from '@midwayjs/core';
import { FilcoinNetworkService } from '../service/filcoin';

@Controller('/filcoin')
export class FilcoinController {
  @Inject()
  service: FilcoinNetworkService;

  @Get('/network/data', { summary: 'filcoin 全网数据' })
  async networkData() {
    return this.service.getNetworkData();
  }

  @Get('/address/:minerId', { summary: '地址详情数据' })
  async minerInfo(@Param('minerId') minerId: string) {
    return this.service.getMinerInfo(minerId);
  }
}
