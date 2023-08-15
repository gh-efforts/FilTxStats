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
      name: 'idx_miner',
      using: 'BTREE',
      fields: [{ name: 'miner' }],
    },
    {
      name: 'idx_address',
      using: 'BTREE',
      fields: [{ name: 'address' }],
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
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: '',
    comment: '是否同步过历史数据',
  })
  isSyncHistory: boolean;
}
