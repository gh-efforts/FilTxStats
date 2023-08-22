export interface IGet {
  url: string;
  query: Record<string, any>;
}

export interface IBlocksRes {
  // 总条数
  totalCount: number;
  blocks: {
    // 区块 id
    cid: string;
    // 区块高度
    height: number;
    // 时间 unix
    timestamp: number;
    winCount: number;
    // 奖励
    reward: string;
  }[];
}
