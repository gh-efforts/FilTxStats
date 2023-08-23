import * as dayjs from 'dayjs';

import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'miner_snapshot',
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
      name: 'idx_miner_name',
      using: 'BTREE',
      fields: [{ name: 'miner_name' }],
    },
  ],
})
export class MinerSnapshotEntity extends Model {
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
    comment: 'miner表name',
    field: 'miner_name',
  })
  minerName: string;

  @Column({
    type: DataType.DECIMAL,
    allowNull: true,
    defaultValue: 0,
    comment: '原始算力，单位byte',
    field: 'raw_power',
  })
  rawPower: number;

  @Column({
    type: DataType.DECIMAL,
    allowNull: true,
    defaultValue: 0,
    comment: '有效算力，单位byte',
  })
  power: number;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
    defaultValue: 0.0,
    comment: '余额，单位fil',
  })
  balance: number;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
    defaultValue: 0.0,
    comment: '扇区质押币，单位fil',
  })
  pledge: number;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
    defaultValue: 0.0,
    comment: '锁仓资产，单位fil',
    field: 'lock_funds',
  })
  lockFunds: number;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
    defaultValue: dayjs().format('YYYY-MM-DD'),
    comment: '日期',
    field: 'date_at',
  })
  dateAt: string;
}
