import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'actors',
  schema: 'public',
  timestamps: false,
})
export class ActorsEntity extends Model {
  @Column({
    type: DataType.TEXT,
    allowNull: false,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  code: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  head: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  nonce: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  balance: string;

  @Column({
    type: DataType.TEXT,
    field: 'state_root',
    allowNull: false,
    primaryKey: true,
  })
  stateRoot: string;

  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    allowNull: false,
  })
  height: number;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  state: string;

  @Column({
    type: DataType.TEXT,
    field: 'code_cid',
    allowNull: true,
  })
  codeCid: string;
}
