import { LanJingSdk } from '@lanjing/http';
import { ILanJingConfig } from '@lanjing/http/src/interface';
import { Config, Init, Provide, Scope, ScopeEnum } from '@midwayjs/core';

@Provide()
@Scope(ScopeEnum.Singleton)
export class LanJingServcie {
  private lanjingIns: LanJingSdk;

  @Config('lanjingConfig')
  lanjingConfig: ILanJingConfig;

  @Init()
  initMethod() {
    let { url, bk_app_code, bk_app_secret, bk_obj_id, bk_username } =
      this.lanjingConfig;
    this.lanjingIns = new LanJingSdk(url, {
      bk_app_code,
      bk_app_secret,
      bk_username,
      bk_obj_id,
    });
  }

  async proxyGHHomePage(body) {
    return this.lanjingIns.proxyGHHomePage(body);
  }
}
