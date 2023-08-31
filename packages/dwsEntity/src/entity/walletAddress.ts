import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'wallet_address',
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
export class WalletAddressEntity extends Model {
  @Column({
    autoIncrement: true,
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    comment: '自增 id',
  })
  id: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    comment: '钱包地址',
  })
  address: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    comment: '数据回调地址',
    field: 'callback_url',
  })
  callbackUrl: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    comment: '是否同步过历史数据',
    field: 'is_sync_history_data',
  })
  isSyncHistoryData: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: '历史数据完成时间',
    field: 'history_data_finish_at',
  })
  historyDataFinishAt: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    comment: '最新高度',
    field: 'latest_height',
  })
  latestHeight: number;
}
