import { Singleton, Inject } from '@midwayjs/core';
import { RedisService } from '@midwayjs/redis';

@Singleton()
class RedisUtils {
  @Inject()
  private redis: RedisService;

  public async checkLock(key: string) {
    const result = await this.redis.get(key);
    return !!result;
  }

  public async getLock(key: string, expireTime: number) {
    const lock = await this.redis.get(key);
    if (lock) {
      return false;
    }

    await this.redis.set(key, 1, 'EX', expireTime);
    return true;
  }

  public async unLock(key) {
    const lock = await this.redis.get(key);
    if (!lock) {
      return true;
    }

    const res = await this.redis.del(key);
    return res;
  }

  public async setValue(key: string, value: string, expireTime?: number) {
    if (!expireTime) {
      await this.redis.set(key, value);
    } else {
      await this.redis.set(key, value, 'EX', expireTime);
    }
  }

  public async getString(key: string) {
    if (!key) {
      return null;
    }

    return await this.redis.get(key);
  }

  public mset(data: string[] | Record<string, string>) {
    return this.redis.mset(data);
  }

  public hset(key: string, data: string[] | Record<string, string>) {
    return this.redis.hset(key, data);
  }

  public hmset(key: string, data: string[] | Record<string, string>) {
    return this.redis.hmset(key, data);
  }

  public hget(key: string, field: string) {
    return this.redis.hget(key, field);
  }

  public hgetall(key: string) {
    return this.redis.hgetall(key);
  }

  public hdel(key: string, field: string[]) {
    return this.redis.hdel(key, ...field);
  }
}

export default RedisUtils;
