import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'gh_aleo_addr',
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
export class GhAleoAddrEntity extends Model {
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
    comment: 'addr',
    field: 'addr',
  })
  addr: string;
}
