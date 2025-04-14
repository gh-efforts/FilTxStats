export interface InOutMessageVO {
  height: number;
  time: string;
  in: number;
  out: number;
}

export interface SumBalanceGroupHeightVO {
  height: number;
  balance: string;
  time: string;
}

export const ListInOutKey = 'listInOut';
export const SumBalanceKey = 'sumBalance';
