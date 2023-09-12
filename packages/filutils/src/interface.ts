export interface IGet {
  url: string;
  query: Record<string, any>;
}

export interface Ilonelyblock {
  miner: string;
  height: number;
  pageIndex: number;
  pageSize: number;
}
export type Lonelyblock = {
  blocks: {
    cid: string;
    height: number;
    isVerified: number;
    miner: string;
    minerTime: string;
    minerTag: string;
  }[];
  height: number;
  time: string;
  timeAgo: number;
};
export interface LonelyblockRes {
  data: Lonelyblock[];
  pageIndex: number;
  pageSize: number;
  total: number;
}

export interface IPost {
  url: string;
  data: Record<string, any>;
}
