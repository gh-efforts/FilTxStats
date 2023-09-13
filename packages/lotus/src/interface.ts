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
