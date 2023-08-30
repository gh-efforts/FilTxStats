import { Config, Init, Inject, Provide } from '@midwayjs/core';

import { PixiuSdk } from '@pixiu/http';

import { MinerEntity, MinerMapping } from '@dws/entity';
import { BaseService } from '../../core/baseService';

import { WhereOptions } from 'sequelize';

@Provide()
export class MinerService extends BaseService<MinerEntity> {
  @Inject()
  mapping: MinerMapping;

  @Config('pixiuConfig.url')
  pixiuUrl;

  private pixiu: PixiuSdk;

  @Init()
  async initMethod() {
    this.pixiu = new PixiuSdk(this.pixiuUrl);
  }

  async modifyMiner(values: { [x: string]: any }, where?: any) {
    return this.mapping.modifyMiner(values, {
      where,
    });
  }

  async getMinerList(where?: WhereOptions<MinerEntity>) {
    return this.mapping.getMinerList(where);
  }

  async syncMinerBaseInfo() {
    const miners = (
      await this.getMinerList({
        address: '',
        sectoSize: 0,
      })
    ).map(item => item.miner);
    const minerBases = await this.pixiu.getMinerStaticState(miners);

    for (let miner of miners) {
      const minerBase = minerBases.find(item => item.minerId === miner);
      if (!minerBase) {
        this.ctx.logger.error('miner base not found', miner);
        continue;
      }

      await this.mapping.modifyMiner(
        {
          address: minerBase.address,
          sectoSize: minerBase.sector_size,
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
