export interface StateMinerInfoRes {
  Owner: string;
  Worker: string;
  NewWorker: string | null;
  ControlAddresses: string[] | null;
  WorkerChangeEpoch: number;
  PeerId: string;
  Multiaddrs: null;
  WindowPoStProofType: number;
  SectorSize: number;
  WindowPoStPartitionSectors: number;
  ConsensusFaultElapsed: number;
  Beneficiary: string;
  BeneficiaryTerm: {
    Quota: string;
    UsedQuota: string;
    Expiration: number;
  };
  PendingBeneficiaryTerm: null;
}

export interface ChainGetTipSetByHeightRes {
  Cids: {
    [key: string]: string;
  }[];
  Blocks: {
    Miner: string;
    Ticket: {
      VRFProof: string;
    };
    ElectionProof: {
      WinCount: number;
      VRFProof: string;
    };
    BeaconEntries: {
      Round: number;
      Data: string;
    }[];
    WinPoStProof: {
      PoStProof: number;
      ProofBytes: string;
    }[];
    Parents: {
      '/': string;
    }[];
    ParentWeight: string;
    Height: number;
    ParentStateRoot: {
      '/': string;
    };
    ParentMessageReceipts: {
      '/': string;
    };
    Messages: {
      '/': string;
    };
    BLSAggregate: {
      Type: number;
      Data: string;
    };
    Timestamp: number;
    BlockSig: {
      Type: number;
      Data: string;
    };
    ForkSignaling: number;
    ParentBaseFee: string;
  }[];
  Height: number;
}

export interface StateMinerSectorCountRes {
  Live: number;
  Active: number;
  Faulty: number;
}

export interface IStateMinerAvailableBalanceRes {
  jsonrpc: string;
  result: string;
  id: number;
}

export interface IStateReadStateRes {
  Balance: string;
  Code: any;
  State: { InitialPledge: string; LockedFunds: string };
}

export interface IStateMinerPowerRes {
  MinerPower: { RawBytePower: string; QualityAdjPower: string };
  TotalPower: { RawBytePower: string; QualityAdjPower: string };
  HasMinPower: boolean;
}

export interface IStateGetActorRes {
  Balance: string;
}

export interface IStateMinerInfoRes {
  Owner: string;
  Worker: string;
  ControlAddresses: string[];
}

export interface IStateLookupRobustAddressRes {
  jsonrpc: string;
  result: string;
  id: number;
}

export interface IStateLookupIDRes {
  jsonrpc: string;
  result: string;
  id: number;
}

export interface IStateDecodeParamsRes {
  NewControlAddrs: string[] | null;
  NewWorker: string;
}

export interface IChainGetMessageRes {
  Params: string;
}
