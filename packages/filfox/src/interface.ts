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

export interface IMinerInfo {
  id: string;
  robust: string;
  actor: string;
  createHeight: number;
  createTimestamp: number;
  lastSeenHeight: number;
  lastSeenTimestamp: number;
  balance: string;
  messageCount: number;
  timestamp: number;
  tokens: number;
  miner: {
    owner: {
      address: string;
      balance: string;
    };
    worker: {
      address: string;
      balance: string;
    };
    beneficiary: {
      address: string;
      balance: string;
    };
    controlAddresses: {
      address: string;
      balance: string;
    }[];
    peerId: string;
    multiAddresses: string[];
    sectorSize: number;
    rawBytePower: string;
    qualityAdjPower: string;
    networkRawBytePower: string;
    networkQualityAdjPower: string;
    blocksMined: number;
    weightedBlocksMined: number;
    totalRewards: string;
    sectors: {
      live: number;
      active: number;
      faulty: number;
      recovering: number;
    };
    preCommitDeposits: string;
    vestingFunds: string;
    initialPledgeRequirement: string;
    availableBalance: string;
    sectorPledgeBalance: string;
    pledgeBalance: string;
    rawBytePowerRank: number;
    qualityAdjPowerRank: number;
  };
  ownedMiners: any[];
  workerMiners: any[];
  benefitedMiners: any[];
  address: string;
}
