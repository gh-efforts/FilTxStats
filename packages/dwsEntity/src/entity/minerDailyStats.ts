import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'miner_daily_stats',
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
      name: 'idx_miner_date_at',
      unique: true,
      using: 'BTREE',
      fields: [{ name: 'miner' }, { name: 'date_at' }],
    },
  ],
})
export class MinerDailyStatsEntity extends Model {
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
    defaultValue: '',
    comment: 'miner',
  })
  miner: string;

  @Column({
    type: DataType.DECIMAL(30, 18),
    allowNull: false,
    defaultValue: 0.0,
    comment: '奖励值，单位fil',
  })
  reward: number;

  @Column({
    type: DataType.DECIMAL(32, 0),
    allowNull: true,
    defaultValue: 0,
    comment: '算力新增，单位byte',
    field: 'power_increase_24h',
  })
  powerIncrease24H: number;

  @Column({
    type: DataType.DECIMAL(30, 18),
    allowNull: false,
    defaultValue: 0.0,
    comment: 'GAS消耗，单位fil',
  })
  gas: number;

  @Column({
    type: DataType.DECIMAL(30, 18),
    allowNull: false,
    defaultValue: 0.0,
    comment: 'WP消耗，单位fil',
    field: 'window_post',
  })
  windowPost: number;

  @Column({
    type: DataType.DECIMAL(30, 18),
    allowNull: false,
    defaultValue: 0.0,
    comment: '质押币消耗，单位fil',
    field: 'pledge_consume',
  })
  pledgeConsume: number;

  @Column({
    type: DataType.DECIMAL(30, 18),
    allowNull: false,
    defaultValue: 0.0,
    comment: '质押币反还，单位fil',
    field: 'pledge_return',
  })
  pledgeReturn: number;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
    comment: '日期',
    field: 'date_at',
  })
  dateAt: string;
}
