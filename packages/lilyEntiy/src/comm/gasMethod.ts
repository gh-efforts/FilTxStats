export enum gasMethod {
  Send = 0,
  AddBalance = 2,
  PublishStorageDeals = 4,
  SubmitWindowedPoSt = 5,
  PreCommitSector = 6,
  ProveCommitSector = 7,
  BlockOut = 14,
  ProveReplicaUpdates = 27,
  PreCommitSectorBatch = 25,
  ProveCommitAggregate = 26,
}

export enum METHOD {
  CHANGE_WORKER = 'ChangeWorkerAddress',
  CHANGE_OWNER = 'ChangeOwnerAddress',
}

export interface IGas32Data {
  to: string;
  method: number;
  base_fee_burn: string;
  over_estimation_burn: string;
  miner_tip: string;
}
