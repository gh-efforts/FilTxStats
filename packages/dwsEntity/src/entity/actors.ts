import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'actors',
  timestamps: false,
  paranoid: false,
  createdAt: true,
  updatedAt: false,
  deletedAt: false,
})
export class ActorsEntity extends Model {
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
    type: DataType.INTEGER,
    allowNull: false,
    field: 'height',
    comment: '高度',
  })
  height: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'cid',
    comment: '地址',
  })
  cid: string;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
    field: 'balance',
    comment: '余额',
  })
  balance: string;

  @Column({
    type: DataType.TINYINT,
    allowNull: false,
    field: 'fill',
    comment: '是否程序填充 0=>否；1=>是',
  })
  fill: number;
}
