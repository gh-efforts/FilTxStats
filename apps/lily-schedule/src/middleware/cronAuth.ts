import { IMiddleware, MidwayHttpError, Config } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';
import { Middleware } from '@midwayjs/decorator';

@Middleware()
export default class CronMiddleware
  implements IMiddleware<Context, NextFunction>
{
  @Config('cronWhiteIP')
  cronWhiteIp;

  @Config('realEnv')
  realEnv;

  public static getName(): string {
    return 'cron';
  }

  public resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const key = 'x-real-ip';
      let ip = ctx.get(key);
      if (ip.substring(0, 7) === '::ffff:') {
        ip = ip.substring(7);
      }
      console.log('中台IP为: ', ip);
      if (this.realEnv !== 'local' && this.cronWhiteIp !== ip) {
        throw new MidwayHttpError('禁止访问!', 403);
      }

      await next();
    };
  }
}
