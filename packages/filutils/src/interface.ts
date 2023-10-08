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
export type LonelyblockV1 = {
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
export type Lonelyblock = {
  //v2格式
  cid: string;
  height: number;
  miner: string;
  mineTime: string;
  minerTag: string;
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
