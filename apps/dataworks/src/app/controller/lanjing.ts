import { Controller, Inject, Post } from '@midwayjs/core';
import { LanJingServcie } from '../service/lanjing';
import { Context } from '@midwayjs/koa';

@Controller('/lanjing')
export class LanJingController {
  @Inject()
  service: LanJingServcie;

  @Inject()
  ctx: Context;

  @Post('/proxy/gh/home', { summary: '代理 gh homepage' })
  async proxyGHHome() {
    return this.service.proxyGHHomePage(this.ctx.request.body);
  }
}
