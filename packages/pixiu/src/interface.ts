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
  minerGasDetails: { method: 4 | 6 | 7 | 25 | 26; gas_fee: string }[] | null;
  PreAndProveBatchBurn:
    | { method: 4 | 6 | 7 | 25 | 26; gas_fee: string }[]
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

export type MinerStaticRes = {
  // 短地址
  minerId: string;
  // 长地址
  address: string;
  // 扇区大小/byte
  sector_size: number;
};
