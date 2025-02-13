// import { MinerEntity } from '@dws/entity';
import {
  ILogger,
  Inject,
  Logger,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/core';
// import BigNumber from 'bignumber.js';
import * as dwsEntity from '@dws/entity';
import * as insightEntity from '@insight/entity';
import { MINER_CREATED, ee, MINER_UPDATED, MINER_DELETED } from '@dws/entity';
import BigNumber from 'bignumber.js';

/**
 * dwsEntity 中发事件，这里接受
 */
@Provide()
@Scope(ScopeEnum.Singleton)
export class SyncInsightMinerService {
  @Inject()
  insightMinerMapping: insightEntity.MinerMapping;

  @Inject()
  minerMapping: dwsEntity.MinerMapping;

  @Logger()
  logger: ILogger;

  initListener() {
    this.logger.info('init sync insight miner listener');

    //创建
    ee.on(MINER_CREATED, async (miner: dwsEntity.MinerEntity) => {
      this.logger.info('receive create %s', miner.miner);
      try {
        let existMiner = await this.insightMinerMapping.getModel().findOne({
          where: {
            minerName: miner.miner,
          },
        });
        if (existMiner) {
          return;
        }
        await this.insightMinerMapping.getModel().create({
          minerName: miner.miner,
          sectorSize: BigNumber(miner.sectorSize)
            .dividedBy(1024 * 1024 * 1024)
            .toString(),
          type: this.transferMinerType(miner.dataType, miner.typeId),
        });
      } catch (e) {
        this.logger.error(e);
      }
    });
    //更新
    ee.on(MINER_UPDATED, async (miner: dwsEntity.MinerEntity) => {
      this.logger.info('receive update %s', miner.miner);
      try {
        if (miner.dataType && miner.typeId && miner.sectorSize) {
          await this.insightMinerMapping.getModel().upsert(
            {
              sectorSize: BigNumber(miner.sectorSize)
                .dividedBy(1024 * 1024 * 1024)
                .toString(),
              type: this.transferMinerType(miner.dataType, miner.typeId),
              minerName: miner.miner,
            },
            {
              fields: ['miner_name'],
            }
          );
        }
      } catch (e) {
        this.logger.error(e);
      }
    });
    //删除
    ee.on(MINER_DELETED, async (miner: dwsEntity.MinerEntity) => {
      this.logger.info('receive del %s', miner.miner);
      try {
        await this.insightMinerMapping.getModel().destroy({
          where: {
            minerName: miner.miner,
          },
        });
      } catch (e) {
        this.logger.error(e);
      }
    });
  }

  /**
dws:
  `data_type` tinyint(4) unsigned NOT NULL DEFAULT '1' COMMENT '数据类型 1-DC 2-CC',

  `type_id` int(11) unsigned NOT NULL DEFAULT '1' COMMENT '节点业务类型',
1	云算力
2	机构联合
3	自营
4	独立节点
5	智能合约
6	KA客户
7	自营-抵押节点
8	基金

insight：
  `type` enum('CLOUD','CLOUD_DATACAP',
  'UNION','
  DATACAP',   //不会有了
  'CLOUD_UNION',  //不会有了
  'UNION_DATACAP',
  'DATALINE' //不会有了
  )

   * @param type
   */
  private transferMinerType(dataType: number, typeId: number) {
    switch (typeId) {
      case 1:
        if (dataType == 1) {
          return 'CLOUD_DATACAP';
        }
        return 'CLOUD';
      case 2:
        if (dataType == 1) {
          return 'UNION_DATACAP';
        }
        return 'UNION';
    }
    return null;
  }
}
