export interface MinerGas {
  miner: string;
  minerGasDetails: {
    method: string;
    gasfee: string;
  }[];
  preAndProveBatchBurn: {
    method: string;
    gasfee: string;
  }[];
  minerPenalty: string;
}
