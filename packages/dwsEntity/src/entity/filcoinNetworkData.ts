import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'filcoin_network_data',
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      name: 'PRIMARY',
      unique: true,
      using: 'BTREE',
      fields: [{ name: 'id' }],
    },
    {
      name: 'idx_created_at',
      using: 'BTREE',
      fields: [{ name: 'created_at' }],
    },
  ],
})
export class FilcoinNetworkDataEntity extends Model {
  @Column({
    autoIncrement: true,
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    comment: '主键自增id',
  })
  id: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    comment: '最新区块高度',
    field: 'latest_height',
  })
  latestHeight: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    comment: '最新区块时间',
    field: 'latest_block_time',
  })
  latestBlockTime: number;

  @Column({
    type: DataType.DECIMAL(30, 4),
    allowNull: false,
    comment: '近24h增长算力/PiB',
    field: 'power_increase_24h',
  })
  powerIncrease24H: number;

  @Column({
    type: DataType.DECIMAL(30, 0),
    allowNull: false,
    comment: '近24h出块奖励/FIL',
    field: 'rewards_increase_24h',
  })
  rewardsIncrease24H: number;

  @Column({
    type: DataType.DECIMAL(30, 0),
    allowNull: false,
    comment: '全网出块奖励/FIL',
    field: 'total_rewards',
  })
  totalRewards: number;

  @Column({
    type: DataType.DECIMAL(20, 4),
    allowNull: false,
    comment: '当前基础费率',
    field: 'base_fee',
  })
  baseFee: number;

  @Column({
    type: DataType.DECIMAL(30, 4),
    allowNull: false,
    comment: '全网有效算力/EB',
    field: 'total_quality_power',
  })
  totalQualityPower: number;

  @Column({
    type: DataType.DECIMAL(30, 4),
    allowNull: false,
    comment: '当前扇区质押量 FIL/TiB',
    field: 'miner_initial_pledge',
  })
  minerInitialPledge: number;

  @Column({
    type: DataType.DECIMAL(30, 4),
    allowNull: false,
    comment: '近24h产出效率 FIL/TiB',
    field: 'fil_per_tera_24h',
  })
  filPerTera24H: number;

  @Column({
    type: DataType.DECIMAL(30, 4),
    allowNull: false,
    comment: '预估32GiB扇区新增算力成本 /FIL/Tib',
    field: 'add_power_in_32g',
  })
  addPowerIn32G: number;

  @Column({
    type: DataType.DECIMAL(30, 4),
    allowNull: false,
    comment: '预估64GiB扇区新增算力成本 /FIL/Tib',
    field: 'add_power_in_64g',
  })
  addPowerIn64G: number;

  @Column({
    type: DataType.DECIMAL(30, 4),
    allowNull: false,
    comment: '32GiB扇区Gas消耗',
    field: 'gas_in_32g',
  })
  gasIn32G: number;

  @Column({
    type: DataType.DECIMAL(30, 4),
    allowNull: false,
    comment: '64GiB扇区Gas消耗',
    field: 'gas_in_64g',
  })
  gasIn64G: number;

  @Column({
    type: DataType.DECIMAL(30, 3),
    allowNull: false,
    comment: '每赢票奖励/FIL',
    field: 'win_count_reward',
  })
  winCountReward: number;

  @Column({
    type: DataType.DECIMAL(30, 4),
    allowNull: false,
    comment: '平均每高度区块数量',
    field: 'avg_block_count',
  })
  avgBlockCount: number;

  @Column({
    type: DataType.DECIMAL(30, 4),
    allowNull: false,
    comment: '平均每高度消息数',
    field: 'avg_message_count',
  })
  avgMessageCount: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    comment: '活跃节点数',
    field: 'active_miners',
  })
  activeMiners: number;

  @Column({
    type: DataType.DECIMAL(30, 0),
    allowNull: false,
    comment: '销毁量/FIL',
  })
  burnt: number;

  @Column({
    type: DataType.DECIMAL(20, 18),
    allowNull: false,
    comment: '流通率',
    field: 'circulating_percent',
  })
  circulatingPercent: number;
}
