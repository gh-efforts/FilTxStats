import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'wallet_type',
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
export class WalletTypeEntity extends Model {
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
    type: DataType.STRING(255),
    allowNull: false,
    comment: '钱包类型表',
    field: 'name',
  })
  name: string;
}
