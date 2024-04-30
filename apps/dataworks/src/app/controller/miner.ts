import {
  ALL,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
} from '@midwayjs/core';
import * as MinerDTO from '../model/dto/miner';
import { MinerService } from '../service/miner';
import { IMinerEncapsulationParam } from '@dws/utils';

@Controller('/miner')
export class MinerController {
  @Inject()
  service: MinerService;

  @Post('/register', { summary: '注册 miner' })
  async register(@Body(ALL) params: MinerDTO.RegisterDTO) {
    const { miners } = params;
    return this.service.register(miners);
  }

  @Get('/sector/size', { summary: '获取 miner 扇区大小' })
  async getMinerSectorSize(@Query(ALL) params: MinerDTO.SectorSizeDTO) {
    return this.service.getMinerSectorSize(params);
  }

  @Post('/sync_miner_reward', {
    summary: '从filfox同步历史区块奖励数据',
  })
  async getMinerHisRewardFromFilfox(
    @Body(ALL) param?: MinerDTO.SyncMinerRewardHistoryDTO
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
  async syncMinerEncapsulation(@Body(ALL) param: IMinerEncapsulationParam) {
    return this.service.runJob('minerEncapsulation', param);
  }

  @Post('/sync_miner_sector', {
    summary: '同步 miner 昨日扇区数据',
  })
  async syncMinerSector() {
    return this.service.runJob('minerSector');
  }

  @Post('/sync_miner_sector_expired', {
    summary: '同步 miner 昨日过期扇区数据',
  })
  async syncMinerSectorExpired() {
    return this.service.runJob('minerSectorExpired');
  }

  @Post('/sync_miner_node', {
    summary: '同步 miner 相关节点地址',
  })
  async syncMinerNode(@Body(ALL) param: MinerDTO.SyncMinerNodeDTO) {
    param.miners.map(miner => {
      this.service.runJob('minerNode', {
        miner,
      });
    });
    return true;
  }

  @Post('/sync_miner_node_change', {
    summary: '同步 miner 相关节点地址变化',
  })
  async syncMinerNodeChange() {
    return this.service.runJob('minerNodeChange');
  }

  @Post('/sync_node_address', {
    summary: '同步 相关节点交易记录，任务阶段，最新',
  })
  async syncNodeAddress(@Body(ALL) param: MinerDTO.SyncTransactionDTO) {
    return this.service.runJob('transactionTask', {
      miners: param.miners,
    });
  }

  @Post('/sync_node_address_history', {
    summary: '同步 相关节点交易记录，任务阶段；历史节点',
  })
  async syncNodeAddressHistory(@Body(ALL) param: MinerDTO.SyncTransactionDTO) {
    return this.service.runJob('transactionTask', {
      isHistory: true,
    });
  }

  @Post('/sync_node_address_one', {
    summary: '同步 相关节点交易记录，任务阶段; 特定一个',
  })
  async syncTransactionOne(@Body(ALL) param: { ids: number[] }) {
    return this.service.runJob('transactionTask', {
      transactionIds: param.ids,
    });
  }

  @Post('/sync_miner_balance', {
    summary: '同步 miner 质押数据',
  })
  async syncMinerBalance() {
    return this.service.runJob('minerBalance');
  }
}
