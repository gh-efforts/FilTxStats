import * as dwsEntity from '@dws/entity';
import * as lilyEntity from '@lily/entity';

import { MidwayAppInfo, MidwayConfig } from '@midwayjs/core';

const entity = entity => {
  const arr = [];
  Object.keys(entity).map(key => {
    if (new RegExp('Entity').test(key)) {
      arr.push(entity[key]);
    }
  });
  return arr;
};
export default (appInfo: MidwayAppInfo): MidwayConfig => {
  const config = {} as MidwayConfig;

  config.realEnv = 'local';

  config.keys = appInfo.name + '_1640593084642_6476';

  config.accessLogConfig = {
    ignore: [/\/swagger-u.*/u],
  };

  config.security = {
    csrf: {
      enable: false,
    },
  };

  config.jwt = {
    secret: '123456',
    expiresIn: 1000 * 60 * 60 * 24,
  };

  config.jwtWhitelist = [
    '/swagger-ui',
    '/api/crontab',
    '/api/miner/page',
    '/api/miner/names',
    '/api/miner/miner_page',
    '/api/miner/obj',
    '/api/machine_room/list',
    '/api/cluster/update',
    '/api/cluster/list',
    '/api/cluster/select',
  ];

  config.cors = {
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    credentials: true,
    origin: req => req.headers.origin,
  };

  config.sequelize = {
    dataSource: {
      default: {
        dialect: 'mysql',
        define: {
          timestamps: true, // 是否需要增加createdAt、updatedAt、deletedAt字段
          paranoid: true, // 此种模式下，删除数据时不会进行物理删除，而是设置deletedAt为当前时间
          underscored: true, // 所有属性设置下划线
          freezeTableName: true, //不会尝试更改模型名以获取表名。否则，型号名称将是复数
          engine: 'innodb', // 默认的存储引擎
        },
        timezone: '+08:00',
        benchmark: true,
        logging: (sql, timing) => {
          // 每次日志输出都会调用的函数，可以在此进行重写
          if (typeof timing === 'number' && timing > 5000) {
            // 记录执行时间超过阈值的sql
            console.warn(`[sequelize](${timing} ms) ${sql}`);
          }
        },
        dialectOptions: {
          // 此处配置将直接传给数据库
          connectTimeout: 30000, // 单次查询连接超时时间
          dateStrings: true, // 不会返回UTC格式时间
          typeCast: true, // 驼峰命名
          bigNumberStrings: true, // bigInt和decimal 以字符串返回
        },
        sync: false, // 本地的时候，可以通过sync: true直接createTable
        entities: entity(dwsEntity),
      },
      lily: {
        dialect: 'postgres',
        dialectOptions: {
          // 此处配置将直接传给数据库
          connectTimeout: 30000, // 单次查询连接超时时间
          dateStrings: true, // 不会返回UTC格式时间
          typeCast: true, // 驼峰命名
          bigNumberStrings: true, // bigInt和decimal 以字符串返回
        },
        entities: entity(lilyEntity),
      },
    },
    defaultDataSourceName: 'default',
  };

  config.koa = {
    contextLoggerFormat: info => {
      //上下文日志配置，有ctx
      const ctx = info.ctx || {};
      return `${info.timestamp} ${info.LEVEL} ${info.pid} [${ctx.reqId} - ${
        Date.now() - ctx.startTime
      }ms ${ctx.method} ${ctx.url}] ${info.message}`;
    },
    port: 7002,
    globalPrefix: '/api',
    serverTimeout: 30 * 1000,
  };

  config.midwayLogger = {
    clients: {
      default: {
        fileLogName: 'insight',
        level: 'info',
        consoleLevel: 'info',
      },
      appLogger: {
        //应用日志没有 ctx，只有上下文日志才有
        enableJSON: true,
        enableFile: true,
        enableConsole: true,
        jsonFormat: (info, meta) => {
          const { timestamp, message } = info;
          const { pid, level } = meta;
          const obj = {
            timestamp,
            level,
            pid,
            message,
          };
          return obj;
        },
      },
    },
  };

  config.timeAndHeight = {
    time: '2023-01-01 00:00:00',
    height: 2473200,
  };

  config.obsConfig = {
    bucket: 'insight',
    accessKeyId: '5NIZNXJYT2CWRP9AN7R2',
    secretAccessKey: 'qNnH0evgAlbnowmYPdsIJyYVKky8rbgTOx3bYrpP',
    server: 'https://obs.sa-brazil-1.myhuaweicloud.com',
    url: 'https://insight.obs.sa-brazil-1.myhuaweicloud.com',
  };

  config.logaConfig = {
    url: 'https://rpc-mainnet-filecoin.pandarua.dev/rpc/v0',
    token: '',
  };

  config.pixiuConfig = {
    url: 'https://pixiu-mainnet.filmeta.net',
  };

  config.galaxyConfig = {
    url: 'https://pixiu-mainnet.filmeta.net',
  };

  config.filutilsConfig = {
    url: 'https://api.filutils.com/api/v2',
  };

  config.lotusConfig = {
    url: 'http://128.136.157.166:43234/rpc/v0',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBbGxvdyI6WyJyZWFkIiwid3JpdGUiLCJzaWduIiwiYWRtaW4iXX0.joDYscIU3BijQtHXWwIUwHhgVLLYvX-A_ij1Uq0wo3Q',
  };

  config.qiNiuYunConfig = {
    email: 'storage_user@qiniu.com',
    password: '6pyNH5R%%Paz',
  };

  config.bull = {
    defaultQueueOptions: {
      redis: 'redis://127.0.0.1:6379',
      prefix: '{midway-bull}',
    },
    clearRepeatJobWhenStart: true,
  };

  config.bullBoard = {
    basePath: '/ui',
  };

  return config;
};
