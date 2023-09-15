import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'parsed_messages',
  timestamps: false,
})
export class ParsedMessagesEntity extends Model {
  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'cid',
  })
  cid: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'height',
  })
  height: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'from',
  })
  from: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'to',
  })
  to: string;

  @Column({
    type: DataType.NUMBER,
    allowNull: false,
    field: 'value',
  })
  value: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'method',
  })
  method: string;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    field: 'params',
  })
  params: { NewWorker: string; NewControlAddrs: string[] | null } | string;
}
