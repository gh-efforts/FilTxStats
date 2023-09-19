import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'transaction_sync_status',
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
export class TransactionSyncStatusEntity extends Model {
  @Column({
    autoIncrement: true,
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    comment: '自增 id',
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '同步 id',
  })
  syncId: string;

  @Column({
    type: DataType.TINYINT,
    allowNull: false,
    comment: '同步类型: 1: derived_gas_outputs 2: vm_messages',
  })
  type: number;

  @Column({
    type: DataType.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '同步状态: -1 异常 0 未开始 1 进行中 2 完成',
  })
  status: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '起始高度',
    field: 'start_height',
  })
  startHeight: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '结束高度',
    field: 'end_height',
  })
  endHeight: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    comment: '运行中的高度，不断更新',
    field: 'runing_height',
  })
  runingHeight: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: '一组地址',
  })
  address: string;
}
