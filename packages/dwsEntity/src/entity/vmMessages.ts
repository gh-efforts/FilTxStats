import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'vm_messages',
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      name: 'PRIMARY',
      unique: true,
      using: 'BTREE',
      fields: [{ name: 'id' }],
    },
    {
      name: 'vm_messages_pkey',
      unique: true,
      using: 'BTREE',
      fields: [
        { name: 'height' },
        { name: 'state_root' },
        { name: 'cid' },
        { name: 'source' },
      ],
    },
    {
      name: 'vm_messages_actor_code_method_idx',
      using: 'BTREE',
      fields: [{ name: 'method' }, { name: 'actor_code' }],
    },
    {
      name: 'vm_messages_from_idx',
      using: 'BTREE',
      fields: [{ name: 'from' }],
    },
    {
      name: 'vm_messages_height_idx',
      using: 'BTREE',
      fields: [{ name: 'height' }],
    },
    {
      name: 'vm_messages_to_idx',
      using: 'BTREE',
      fields: [{ name: 'to' }],
    },
  ],
})
export class VmMessagesEntity extends Model {
  @Column({
    autoIncrement: true,
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    comment: '自增 id',
  })
  id: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  height: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'state_root',
  })
  stateRoot: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
  })
  cid: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  source: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  from: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  to: string;

  @Column({
    type: DataType.DECIMAL(38, 2),
    allowNull: false,
  })
  value: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  method: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'actor_code',
  })
  actorCode: string;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    field: 'exit_code',
  })
  exitCode: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    field: 'gas_used',
  })
  gasUsed: number;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  params: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  returns: string;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  index: number;
}
