// 导出数据库所有表的 Entity 类
import { ActorsEntity } from "./src/entity/actors";
import { ExchangeAddressEntity } from "./src/entity/exchangeAddress";
import { MessagesEntity } from "./src/entity/messages";
import { GlobalConfigEntity } from "./src/entity/globalConfig";
import { ActorsMapping } from "./src/mapping/actors";
import { ExchangeAddressMapping } from "./src/mapping/exchangeAddress";
import { MessagesMapping } from "./src/mapping/messages";
import { GlobalConfigMapping } from "./src/mapping/globalConfig";
import ee, { MINER_CREATED, MINER_DELETED, MINER_UPDATED } from "./src/ee/ee";
import { DailyCacheMapping } from "./src/mapping/dailyCache";
import { DailyCacheEntity } from "./src/entity/dailyCache";

export {
  ActorsEntity,
  ExchangeAddressEntity,
  ActorsMapping,
  ExchangeAddressMapping,
  MessagesEntity,
  MessagesMapping,
  GlobalConfigEntity,
  GlobalConfigMapping,
  ee,
  MINER_CREATED,
  MINER_DELETED,
  MINER_UPDATED,
  DailyCacheEntity,
  DailyCacheMapping,
};
