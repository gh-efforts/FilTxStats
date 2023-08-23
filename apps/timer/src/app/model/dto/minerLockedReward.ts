export interface MinerRewardOptions {
  // 节点名称
  miner: string;
  // 区块 id
  cid: string;
  // 锁仓奖励开始释放的时间
  time: string;
  // 奖励开始释放的小时数
  hour: number;
  // 锁仓奖励开始释放的高度
  height: number;
  // 锁仓奖励
  reward: string;
  // 总共锁仓的奖励，单位fil
  lockedReward?: string;
  // 每天释放金额，单位fil
  dailyReward?: string;
}
