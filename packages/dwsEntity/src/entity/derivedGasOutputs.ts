import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'derived_gas_outputs',
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
      name: 'idx_unique',
      using: 'BTREE',
      fields: [{ name: 'cid' }, { name: 'state_root' }, { name: 'height' }],
    },
    {
      name: 'idx_height',
      using: 'BTREE',
      fields: [{ name: 'height' }],
    },
    {
      name: 'idx_from',
      using: 'BTREE',
      fields: [{ name: 'from' }],
    },
    {
      name: 'idx_to',
      using: 'BTREE',
      fields: [{ name: 'to' }],
    },
    {
      name: 'idx_method',
      using: 'BTREE',
      fields: [{ name: 'method' }],
    },
    {
      name: 'idx_actor_family',
      using: 'BTREE',
      fields: [{ name: 'actor_family' }],
    },
    {
      name: 'idx_exit_code',
      using: 'BTREE',
      fields: [{ name: 'exit_code' }],
    },
  ],
})
export class DerivedGasOutputsEntity extends Model {
  @Column({
    autoIncrement: true,
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    comment: '主键 id',
  })
  id: number;

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
  from: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  to: string;

  @Column({
    type: DataType.DECIMAL(38, 0),
    allowNull: false,
  })
  value: number;

  @Column({
    type: DataType.DECIMAL(38, 0),
    allowNull: false,
    field: 'gas_fee_cap',
  })
  gasFeeCap: number;

  @Column({
    type: DataType.DECIMAL(38, 0),
    allowNull: false,
    field: 'gas_premium',
  })
  gasPremium: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
    field: 'gas_limit',
  })
  gasLimit: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
    field: 'size_bytes',
  })
  sizeBytes: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  nonce: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  method: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    field: 'state_root',
  })
  stateRoot: string;

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
    type: DataType.DECIMAL(38, 0),
    allowNull: false,
    field: 'parent_base_fee',
  })
  parentBaseFee: number;

  @Column({
    type: DataType.DECIMAL(38, 0),
    allowNull: false,
    field: 'base_fee_burn',
  })
  baseFeeBurn: number;

  @Column({
    type: DataType.DECIMAL(38, 0),
    allowNull: false,
    field: 'over_estimation_burn',
  })
  overEstimationBurn: number;

  @Column({
    type: DataType.DECIMAL(38, 0),
    allowNull: false,
    field: 'miner_penalty',
  })
  minerPenalty: number;

  @Column({
    type: DataType.DECIMAL(38, 0),
    allowNull: false,
    field: 'miner_tip',
  })
  minerTip: number;

  @Column({
    type: DataType.DECIMAL(38, 0),
    allowNull: false,
  })
  refund: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    field: 'gas_refund',
  })
  gasRefund: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    field: 'gas_burned',
  })
  gasBurned: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  height: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'actor_name',
  })
  actorName: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'actor_family',
  })
  actorFamily: string;
}
