import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'miner',
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
      name: 'idx_miner_address',
      unique: true,
      using: 'BTREE',
      fields: [{ name: 'miner' }, { name: 'address' }],
    },
  ],
})
export class MinerEntity extends Model {
  @Column({
    autoIncrement: true,
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING(32),
    allowNull: false,
    comment: '节点名称，短地址',
  })
  miner: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    defaultValue: '',
    comment: '长地址',
  })
  address: string;

  @Column({
    type: DataType.DECIMAL(32, 0),
    allowNull: true,
    defaultValue: 0,
    comment: '有效算力，单位byte',
    field: 'sector_size',
  })
  sectoSize: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '是否同步过奖励历史数据',
    field: 'is_sync_reward_history',
  })
  isSyncRewardHistory: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: '区块奖励结束时间',
    field: 'reward_end_at',
  })
  rewardEndAt: string;
}
