import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'messages',
  schema: 'public',
  timestamps: false,
})
export class MessagesEntity extends Model {
  @Column({
    type: DataType.TEXT,
    allowNull: false,
    primaryKey: true,
  })
  cid: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  from: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  to: string;

  @Column({
    type: DataType.INTEGER,
    field: 'size_bytes',
    allowNull: false,
  })
  sizeBytes: number;

  @Column({
    type: DataType.INTEGER,
    field: 'size_bytes',
    allowNull: false,
  })
  nonce: number;

  @Column({
    type: DataType.NUMBER,
    field: 'value',
    allowNull: false,
  })
  value: number;

  @Column({
    type: DataType.NUMBER,
    field: 'gas_fee_cap',
    allowNull: false,
  })
  gasFeeCap: number;

  @Column({
    type: DataType.NUMBER,
    field: 'gas_premium',
    allowNull: false,
  })
  gasPremium: number;

  @Column({
    type: DataType.NUMBER,
    field: 'gas_limit',
  })
  gasLimit: number;

  @Column({
    type: DataType.NUMBER,
    field: 'method',
  })
  method: number;

  @Column({
    type: DataType.NUMBER,
    allowNull: false,
    primaryKey: true,
  })
  height: number;
}
