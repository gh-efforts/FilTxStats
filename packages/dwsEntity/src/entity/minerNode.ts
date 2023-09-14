import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'miner_node',
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      name: 'PRIMARY',
      unique: true,
      using: 'BTREE',
      fields: [{ name: 'id' }],
    },
  ],
})
export class MinerNodeEntity extends Model {
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
    type: DataType.STRING(32),
    allowNull: false,
    comment: 'miner表name',
    field: 'miner_name',
  })
  minerName: string;

  @Column({
    type: DataType.STRING(32),
    allowNull: false,
    comment: '节点名称',
    field: 'name',
    defaultValue: '',
  })
  name: string;

  @Column({
    type: DataType.TINYINT({ length: 1, unsigned: true }),
    allowNull: false,
    comment: '类型：1-worker 2-owner 3-control',
    field: 'type',
    defaultValue: 1,
  })
  type: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    comment: '节点长地址',
    field: 'robust_address',
    defaultValue: '',
  })
  robustAddress: string;

  @Column({
    type: DataType.TINYINT({ length: 1, unsigned: true }),
    allowNull: false,
    comment: '使用状态：0-已弃用 1-在使用',
    field: 'status',
    defaultValue: 0,
  })
  status: number;

  @Column({
    type: DataType.INTEGER({ length: 11, unsigned: true }),
    allowNull: false,
    comment: 'change事件时高度',
    field: 'height',
    defaultValue: 0,
  })
  height: number;
}
