import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'sync_gh_aleo_transfer',
  timestamps: false,
  paranoid: false,
  indexes: [
    {
      name: 'PRIMARY',
      unique: true,
      using: 'BTREE',
      fields: [{ name: 'id' }],
    },
  ],
})
export class SyncAleoTransferEntity extends Model {
  @Column({
    autoIncrement: true,
    type: DataType.INTEGER({ length: 11, unsigned: true }),
    allowNull: false,
    primaryKey: true,
    comment: '主键',
    field: 'id',
  })
  id: number;

  @Column({
    type: DataType.STRING(80),
    allowNull: false,
    comment: 'transaction',
    field: 'transaction',
  })
  transaction: string;

  @Column({
    type: DataType.STRING(80),
    allowNull: false,
    comment: 'transition',
    field: 'transition',
  })
  transition: string;

  @Column({
    type: DataType.TINYINT({ length: 1 }),
    allowNull: false,
    comment: '0false, 1true',
    field: 'accepted',
    defaultValue: 0,
  })
  accepted: number;

  @Column({
    type: DataType.STRING(80),
    allowNull: false,
    comment: 'block_hash',
    field: 'block_hash',
  })
  blockHash: string;

  @Column({
    type: DataType.DECIMAL(32, 0),
    allowNull: false,
    defaultValue: 0.0,
    comment: '奖励值，单位fil',
    field: 'fee',
  })
  fee: number;

  @Column({
    type: DataType.STRING(80),
    allowNull: false,
    comment: 'from',
    field: 'from',
  })
  from: string;

  @Column({
    type: DataType.STRING(80),
    allowNull: false,
    comment: 'to',
    field: 'to',
  })
  to: string;

  @Column({
    type: DataType.STRING(80),
    allowNull: false,
    comment: 'to_private',
    field: 'to_private',
  })
  toPrivate: string;

  @Column({
    type: DataType.STRING(30),
    allowNull: false,
    comment: 'function',
    field: 'function',
  })
  function: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'height',
    field: 'height',
    defaultValue: 0,
  })
  height: number;

  @Column({
    type: DataType.DECIMAL(32, 0),
    allowNull: false,
    defaultValue: 0.0,
    field: 'priority_fee',
    comment: 'priority_fee',
  })
  priorityFee: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'timestamp',
    comment: 'timestamp',
  })
  timestamp: Date;

  @Column({
    type: DataType.DECIMAL(32, 0),
    allowNull: false,
    defaultValue: 0.0,
    field: 'value',
    comment: 'value',
  })
  value: number;
}
