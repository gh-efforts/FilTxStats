import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'messages',
  timestamps: false,
  paranoid: false,
  createdAt: true,
  updatedAt: false,
  deletedAt: false,
})
export class MessagesEntity extends Model {
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
    field: 'cid',
    comment: '地址',
  })
  cid: string;

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
    field: 'from',
    comment: '地址id',
  })
  from: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'to',
    comment: '地址',
  })
  to: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'method',
    comment: '方法',
  })
  method: number;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
    field: 'value',
    comment: '金额',
  })
  value: string;
}
