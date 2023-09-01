import { MinerEntity, MinerMapping } from '@dws/entity';
import { Inject, Provide } from '@midwayjs/core';
import { InjectDataSource } from '@midwayjs/sequelize';
import { Sequelize } from 'sequelize';
import { BaseService } from '../../core/baseService';
import { LilyService } from './lily';

@Provide()
export class MinerService extends BaseService<MinerEntity> {
  @Inject()
  mapping: MinerMapping;

  @Inject()
  service: LilyService;

  // 注入自定义数据源
  @InjectDataSource('lily')
  lilySource: Sequelize;

  /**
   *
   * 根据节点号查询类型
   * @param {string} miner - 节点号
   * @return {Promise<boolean>} - Returns a Promise that resolves to the minimum miner type.
   */
  async getMinerType(miners: string[]) {
    const SQL = `
      SELECT
        deal_id 
      FROM
        market_deal_proposals 
      WHERE
        provider_id = ?
        AND EXISTS ( SELECT 1 FROM market_deal_states WHERE market_deal_states.deal_id = market_deal_proposals.deal_id ) 
        LIMIT 1;
    `;
    for (let miner of miners) {
      const result = await this.service.query<{ deal_id: string } | null>(
        SQL,
        [miner],
        true
      );

      await this.mapping.modifyMiner(
        {
          type: result && result.deal_id ? 'DC' : 'CC',
        },
        {
          where: {
            miner,
          },
        }
      );
    }
    return true;
  }
}
