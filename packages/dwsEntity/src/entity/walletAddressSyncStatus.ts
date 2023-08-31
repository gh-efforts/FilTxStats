import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'wallet_address_sync_status',
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
export class WalletAddressSyncStatusEntity extends Model {
  @Column({
    autoIncrement: true,
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    comment: '自增 id',
  })
  id: number;

  @Column({
    type: DataType.TINYINT,
    allowNull: false,
    comment: '同步状态: -1 异常',
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
    allowNull: true,
    comment: '结束高度',
    field: 'end_height',
  })
  endHeight: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: '一组地址',
  })
  address: string;
}
