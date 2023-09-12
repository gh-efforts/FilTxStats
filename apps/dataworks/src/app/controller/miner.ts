import { ALL, Body, Controller, Inject, Post } from '@midwayjs/core';
import * as MinerDTO from '../model/dto/miner';
import { MinerService } from '../service/miner';

@Controller('/miner')
export class MinerController {
  @Inject()
  service: MinerService;

  @Post('/register', { summary: '注册 miner' })
  async register(@Body(ALL) params: MinerDTO.RegisterDTO) {
    const { miners } = params;
    return this.service.register(miners);
  }

  @Post('/sync_miner_reward', {
    summary: '从filfox同步历史区块奖励数据',
  })
  async getMinerHisRewardFromFilfox(
    @Body(ALL) param: MinerDTO.SyncMinerRewardHistoryDTO
  ) {
    return this.service.syncHisMinerReward(param);
  }

  @Post('/sync_miner_daily_stats', {
    summary: '同步 miner 昨日统计收益',
  })
  async syncMinerDailyStats() {
    return this.service.runJob('minerDailyStats');
  }

  @Post('/sync_miner_snapshot', {
    summary: '同步 miner 最新快照数据',
  })
  async syncMinerSnapshot() {
    return this.service.runJob('minerSnapshot');
  }

  @Post('/sync_miner_base_info', {
    summary: '同步 miner 基础数据',
  })
  async syncMinerBase() {
    return this.service.runJob('minerBaseInfo');
  }

  @Post('/sync_miner_type', {
    summary: '同步 miner 类型',
  })
  async syncMinerType(@Body(ALL) param: MinerDTO.SyncMinerTypeDTO) {
    return this.service.runJob('minerType', param);
  }

  @Post('/sync_miner_encapsulation', {
    summary: '同步 miner 昨日封装数据',
  })
  async syncMinerEncapsulation() {
    return this.service.runJob('minerEncapsulation');
  }
}
