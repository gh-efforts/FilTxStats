import { MidwayConfig, MidwayAppInfo } from "@midwayjs/core";

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

  config.midwayLogger = {
    clients: {
      default: {
        fileLogName: "insight",
        level: "info",
        consoleLevel: "info",
      },
      appLogger: {
        enableJSON: false,
        enableFile: true,
      },
    },
  };

  return config;
};
