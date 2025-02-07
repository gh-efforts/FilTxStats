import { MidwayConfig, MidwayAppInfo } from '@midwayjs/core';

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
    },
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
      insightReport: {
        database: process.env.INSIGHT_DATABASE_DATABASE,
        username: process.env.INSIGHT_DATABASE_USERNAME,
        password: process.env.INSIGHT_DATABASE_PASSWORD,
        host: process.env.INSIGHT_DATABASE_HOST,
        port: +process.env.INSIGHT_DATABASE_PORT,
        logging: false,
      },
    },
  };

  config.jwt = {
    secret: process.env.SECRET,
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

  config.midwayLogger = {
    clients: {
      default: {
        fileLogName: 'insight',
        level: 'info',
        consoleLevel: 'info',
      },
      appLogger: {
        enableJSON: false,
        enableFile: true,
      },
    },
  };

  config.qiNiuYunConfig = {
    email: process.env.QINIUYUN_EMAIL,
    password: process.env.QINIUYUN_PASSWORD,
  };

  config.lanjingConfig = {
    url: process.env.LANJING_URL,
    bk_app_code: process.env.LANJING_BK_APP_CODE,
    bk_app_secret: process.env.LANJING_BK_APP_SECRET,
    bk_username: process.env.LANJING_BK_USERNAME,
    bk_obj_id: process.env.LANJING_BK_OBJ_ID,
  };

  return config;
};
