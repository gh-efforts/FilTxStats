export interface IGet {
  url: string;
  query: Record<string, any>;
}

export interface IPost {
  url: string;
  data: Record<string, any>;
}

export interface ITotalIndicatorsRes {
  result: {
    total_indicators: {
      // 最新区块高度
      latest_height: number;
      // 最新区块时间
      latest_block_time: number;
      // 近24h增长算力/PiB
      power_increase_24h: string;
      // 近24h出块奖励/FIL
      rewards_increase_24h: string;
      // 全网出块奖励/FIL
      total_rewards: string;
      // 当前基础费率
      base_fee: string;
      // 全网有效算力/EB
      total_quality_power: string;
      // 当前扇区质押量 FIL/TiB
      miner_initial_pledge: string;
      // 近24h产出效率 FIL/TiB
      fil_per_tera_24h: string;
      // 预估32GiB扇区新增算力成本 /FIL/Tib
      add_power_in_32g: string;
      // 预估64GiB扇区新增算力成本 /FIL/Tib
      add_power_in_64g: string;
      // 32GiB扇区Gas消耗
      gas_in_32g: string;
      // 64GiB扇区Gas消耗
      gas_in_64g: string;
      // 每赢票奖励/FIL
      win_count_reward: string;
      // 平均每高度区块数量
      avg_block_count: string;
      // 平均每高度消息数
      avg_message_count: string;
      // 活跃节点数
      active_miners: number;
      // 销毁量/FIL
      burnt: string;
      // 流通率
      circulating_percent: string;
    };
  };
}
