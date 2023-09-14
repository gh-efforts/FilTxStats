import { Column, DataType, HasOne, Model, Table } from 'sequelize-typescript';

import { WalletTypeEntity } from './walletType';

@Table({
  tableName: 'wallet',
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
export class WalletEntity extends Model {
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
    type: DataType.INTEGER({ length: 11, unsigned: true }),
    allowNull: false,
    comment: '主键',
    field: 'type_id',
  })
  typeId: number;

  @Column({
    type: DataType.STRING(32),
    allowNull: false,
    comment: '钱包地址(短地址)',
    field: 'name',
  })
  name: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    comment: '钱包地址(长地址)',
    field: 'robust_address',
    defaultValue: '',
  })
  robustAddress: string;

  @Column({
    type: DataType.DECIMAL(30, 18),
    allowNull: false,
    comment: '余额',
    field: 'balance',
    defaultValue: '0',
  })
  balance: string;

  @Column({
    type: DataType.INTEGER({ length: 11, unsigned: true }),
    allowNull: false,
    comment: 'change事件时高度',
    field: 'height',
    defaultValue: 0,
  })
  height: number;

  @Column({
    type: DataType.TINYINT({ length: 1, unsigned: true }),
    allowNull: false,
    comment: '是否实时获取数据 0-否(则采用balance字段值) 1-是',
    field: 'is_real_time',
    defaultValue: 1,
  })
  isRealTime: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    comment: '钱包地址',
    field: 'remark',
    defaultValue: '',
  })
  remark: string;

  @Column({
    type: DataType.INTEGER({ length: 11, unsigned: true }),
    allowNull: false,
    comment: '主键',
    field: 'user_id',
    defaultValue: 0,
  })
  userId: number;

  @HasOne(() => WalletTypeEntity, {
    sourceKey: 'typeId',
    foreignKey: 'id',
  })
  walletType: WalletTypeEntity;
}
