import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'exchange_address',
  timestamps: true,
  paranoid: true,
})
export class ExchangeAddressEntity extends Model {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    comment: '自增主键 id',
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'exchange',
    comment: '交易所名称',
  })
  exchange: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'address_name',
    comment: '地址名称',
  })
  addressName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'address_id',
    comment: '地址id',
  })
  addressId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'address',
    comment: '地址',
  })
  address: string;

  @Column({
    type: DataType.TINYINT,
    allowNull: false,
    field: 'type',
    comment: '钱包类型 1=>归集；2=>冷钱包',
  })
  type: number;
}
