import { ALL, Body, Controller, Inject, Post } from '@midwayjs/core';
import * as MinerDTO from '../model/dto/miner';
import { MinerService } from '../service/miner';

@Controller('/miner')
export class MinerController {
  @Inject()
  service: MinerService;

  @Post('/register')
  async register(@Body(ALL) params: MinerDTO.RegisterDTO) {
    const { miner } = params;
    return this.service.register(miner);
  }
}
