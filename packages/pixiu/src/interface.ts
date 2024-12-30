export interface IGet {
  url: string;
  query: Record<string, any>;
}

export interface IExpireRes {
  code: number;
  msg: string;
  nowTime: number;
  data: {
    minerid: string;
    sectorSize: string;
    stats: {
      date: string;
      num: number;
      powerExpired: string;
    }[];
  }[];
}

export interface IGasFeeByDateRes {
  minerId: string;
  date: string;
  minerPenalty: string;
  minerGasDetails:
    | {
        method: 5 | 4 | 6 | 7 | 25 | 26;
        gas_fee: string;
        from: string;
        id: string;
      }[]
    | null;
  PreAndProveBatchBurn:
    | { method: 5 | 4 | 6 | 7 | 25 | 26; gas_fee: string }[]
    | null;
}

interface IGasFeeGroupItem {
  height: number;
  method: number;
  gas_fee: string;
  parent_base_fee: string;
}

export interface IGasFeeGroupRes {
  PreCommitSector: IGasFeeGroupItem[];
  ProveCommitSector: IGasFeeGroupItem[];
  PreCommitSectorBatch: IGasFeeGroupItem[];
  ProveCommitAggregate: IGasFeeGroupItem[];
}

export type MinerBaseRes = {
  // 节点名称
  miner_id: string;
  // 原值算力/byte
  raw_byte_power: string;
  // 有效算力/byte
  quality_adj_power: string;
  // 锁仓资产/fil
  locked_funds: string;
  // 扇区质押/fil
  initial_pledge: string;
  // 余额
  balance: string;
};

export type MinerRewardRes = {
  // 节点名称
  minerId: string;
  // 奖励
  reward: string;
};

export type MinerStaticRes = {
  // 节点 id
  minerId: string;
  // 长地址
  address: string;
  // 扇区大小/byte
  sector_size: number;
  owner: {
    id: string;
    address: string;
  };
  worker: {
    id: string;
    address: string;
  };
  controller: {
    id: string;
    address: string;
  }[];
};

export type MinerDcSealedRes = {
  // 节点id
  minerId: string;
  // 算力
  sealed: string;
};

export type GetAvgSealGasRes = {
  sealGas32G: string;
  sealGas64G: string;
};

export type MinerPledgeRes = {
  // 节点名称
  miner_id: string;
  // 质押币消耗
  pledge_incr: number;
  // 质押币返还
  pledge_reduce: number;
};

export type MinerSectorStatsPledgeRes = {
  minerid: string;
  sectorSize: string;
  stats:
    | {
        date: string;
        num: number;
        powerExpired: string;
        initialPledge: string;
      }[]
    | null;
};

export type MinerRewardDetailRes = {
  // 节点名称
  miner_id: string;

  Rewards: {
    miner_id?: string;
    // 节点名称
    miner?: string;
    // 区块 id
    cid: string;
    // 锁仓奖励开始释放的时间
    time: string;
    // 奖励开始释放的小时数
    hour: number;
    // 锁仓奖励开始释放的高度
    height: number;
    // 锁仓奖励
    reward: string;
    // 总共锁仓的奖励，单位fil
    lockedReward?: string;
    // 每天释放金额，单位fil
    dailyReward?: string;
  }[];
};

export interface QueryMinerPowerRes {
  miner_id: string;
  raw_byte_power: string;
  quality_adj_power: string;
}
