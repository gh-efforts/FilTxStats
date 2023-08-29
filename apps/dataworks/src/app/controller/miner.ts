import { ALL, Body, Controller, Inject, Post } from '@midwayjs/core';
import * as MinerDTO from '../model/dto/miner';
import { MinerService } from '../service/miner';

@Controller('/miner')
export class MinerController {
  @Inject()
  service: MinerService;

  @Post('/register')
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
    summary: '同步 miner 快照数据',
  })
  async syncMinerSnapshot() {
    return this.service.runJob('minerSnapshot');
  }
}
