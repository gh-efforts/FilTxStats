import { Controller, Get, Inject, Param, Query } from '@midwayjs/core';
import { FilcoinNetworkService } from '../service/filcoin';
import { ByTimeRangeDTO, NetworkByHeightDTO } from '../model/dto/filcoin';

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

  @Get('/network/byheight/data', {
    summary: 'filcoin 根据height查询部分全网数据',
  })
  async networkDataByHeight(@Query() dto: NetworkByHeightDTO) {
    return this.service.getNetworkDataByHeight(dto);
  }

  @Get('/bytime/gas', {
    summary: 'filcoin 全网数据大概统计 gas32, gas64',
  })
  async getGasInfoByTime(@Query() dto: ByTimeRangeDTO) {
    return this.service.getGasInfoByTimeNew(dto);
  }

  @Get('/maxheight/basefee', {
    summary: '从 lily 查询最大basefee',
  })
  async getMaxHeightBaseFee() {
    return this.service.getMaxHeightBaseFee();
  }
}
