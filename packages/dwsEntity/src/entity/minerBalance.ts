import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'miner_balance',
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
      name: 'idx_miner_date',
      unique: true,
      using: 'BTREE',
      fields: [{ name: 'miner' }],
    },
  ],
})
export class MinerBalanceEntity extends Model {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    comment: '自增主键 id',
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    comment: '节点号',
    unique: 'idx_miner_date',
  })
  miner: string;

  @Column({
    type: DataType.DECIMAL(38, 0),
    comment: 'Miner 账户余额',
  })
  balance: number;

  @Column({
    type: DataType.DECIMAL(38, 0),
    comment: 'owner 余额',
  })
  owner: number;

  @Column({
    type: DataType.DECIMAL(38, 0),
    comment: 'worker 余额',
  })
  worker: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    comment: 'Controller 余额',
  })
  controller: string;

  @Column({
    type: DataType.DECIMAL(38, 0),
    comment: 'benf 余额',
  })
  beneficiary: number;
}
