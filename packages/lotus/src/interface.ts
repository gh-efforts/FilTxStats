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
