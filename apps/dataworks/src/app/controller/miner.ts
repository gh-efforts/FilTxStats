import { ALL, Body, Controller, Post } from '@midwayjs/core';
import * as MinerDTO from '../model/dto/miner';

@Controller('/miner')
export class MinerController {
  @Post('/register')
  async register(@Body(ALL) params: MinerDTO.RegisterDTO) {
    return 'Hello Midwayjs!';
  }
}
