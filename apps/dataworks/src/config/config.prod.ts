import { MidwayAppInfo, MidwayConfig } from '@midwayjs/core';

export default (appInfo: MidwayAppInfo): MidwayConfig => {
  const config = {} as MidwayConfig;

  config.realEnv = process.env.REAL_ENV;

  config.redis = {
    client: {
      port: +process.env.REDIS_CLIENT_PORT,
      host: process.env.REDIS_CLIENT_HOST,
      db: +process.env.REDIS_CLIENT_DB,
      password: process.env.REDIS_CLIENT_PASSWORD,
    },
  };

  config.bull = {
    defaultQueueOptions: {
      redis: {
        port: +process.env.REDIS_CLIENT_PORT,
        host: process.env.REDIS_CLIENT_HOST,
        db: +process.env.REDIS_CLIENT_DB,
        password: process.env.REDIS_CLIENT_PASSWORD,
      },
      prefix: '{midway-bull}',
    },
    clearRepeatJobWhenStart: false,
    defaultConcurrency: 10,
  };

  config.sequelize = {
    dataSource: {
      default: {
        database: process.env.DATABASE_DATABASE,
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        host: process.env.DATABASE_HOST,
        port: +process.env.DATABASE_PORT,
        logging: false,
      },
      lily: {
        database: process.env.PG_DATABASE_DATABASE,
        username: process.env.PG_DATABASE_USERNAME,
        password: process.env.PG_DATABASE_PASSWORD,
        host: process.env.PG_DATABASE_HOST,
        port: +process.env.PG_DATABASE_PORT,
        logging: false,
      },
    },
  };

  config.jwt = {
    secret: process.env.JWT_SECRET,
  };

  config.logaConfig = {
    url: process.env.LOGA_URL,
    token: process.env.LOGA_TOEKN,
  };

  config.pixiuConfig = {
    url: process.env.PIXIU_URL,
  };

  config.galaxyConfig = {
    url: process.env.GALAXY_URL,
  };

  config.filfoxConfig = {
    url: process.env.FILFOX_URL,
  };

  config.filscanConfig = {
    url: process.env.FILSCAN_URL,
  };

  config.midwayLogger = {
    clients: {
      appLogger: {
        level: 'info',
        consoleLevel: 'info',
      },
    },
  };

  config.koa = {
    contextLoggerFormat: info => {
      const { ctx, timestamp, LEVEL: level, pid, message } = info;
      const { startTime, method, url, reqId } = ctx;
      const obj = {
        timestamp,
        level,
        pid,
        message,
        reqId,
        startTime,
        method,
        url,
      };
      return JSON.stringify(obj);
    },
  };

  config.cronWhiteIP = process.env.CRON_WHITE_IP;

  config.qiNiuYunConfig = {
    email: process.env.QINIUYUN_EMAIL,
    password: process.env.QINIUYUN_PASSWORD,
  };

  return config;
};
