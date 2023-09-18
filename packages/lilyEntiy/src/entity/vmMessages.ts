import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'vm_messages',
  schema: 'public',
  timestamps: false,
  indexes: [
    {
      name: 'vm_messages_actor_code_method_idx',
      fields: [{ name: 'actor_code' }, { name: 'method' }],
    },
    {
      name: 'vm_messages_from_idx',
      fields: [{ name: 'from' }],
    },
    {
      name: 'vm_messages_height_idx',
      fields: [{ name: 'height' }],
    },
    {
      name: 'vm_messages_pkey',
      unique: true,
      fields: [
        { name: 'height' },
        { name: 'state_root' },
        { name: 'cid' },
        { name: 'source' },
      ],
    },
    {
      name: 'vm_messages_to_idx',
      fields: [{ name: 'to' }],
    },
  ],
})
export class VmMessagesEntity extends Model {
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    comment: 'Height message was executed at.',
    primaryKey: true,
  })
  height: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    comment: 'CID of the parent state root at which this message was executed.',
    primaryKey: true,
    field: 'state_root',
  })
  stateRoot: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    comment: 'CID of the message (note this CID does not appear on chain).',
    primaryKey: true,
  })
  cid: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    comment:
      'CID of the on-chain message or implicit (internal) message that caused this message to be sent.',
    primaryKey: true,
  })
  source: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    comment: 'Address of the actor that sent the message.',
  })
  from: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    comment: 'Address of the actor that received the message.',
  })
  to: string;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
    comment: 'Amount of FIL (in attoFIL) transferred by this message.',
  })
  value: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    comment:
      'The method number invoked on the recipient actor. Only unique to the actor the method is being invoked on. A method number of 0 is a plain token transfer - no method execution',
  })
  method: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    comment: 'The CID of the actor that received the message.',
    field: 'actor_code',
  })
  actorCode: string;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    comment:
      'The exit code that was returned as a result of executing the message.',
    field: 'exit_code',
  })
  exitCode: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    comment:
      'A measure of the amount of resources (or units of gas) consumed, in order to execute a message.',
    field: 'gas_used',
  })
  gasUsed: number;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Message parameters parsed and serialized as a JSON object.',
  })
  params: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment:
      'Result returned from executing a message parsed and serialized as a JSON object.',
  })
  returns: string;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    comment: 'Order in which the message was applied.',
  })
  index: number;
}
