import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'derived_gas_outputs',
  timestamps: false,
  schema: 'public',
})
export class DerivedGasOutputsEntity extends Model {
  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'cid',
    primaryKey: true,
  })
  cid: string;

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
    type: DataType.DECIMAL,
    allowNull: false,
    field: 'value',
  })
  value: string;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
    field: 'gas_fee_cap',
  })
  gasFeeCap: string;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
    field: 'gas_premium',
  })
  gasPremium: string;

  @Column({
    type: DataType.INTEGER,
    field: 'gas_limit',
  })
  gasLimit: string;

  @Column({
    type: DataType.INTEGER,
    field: 'size_bytes',
  })
  sizeBytes: string;

  @Column({
    type: DataType.INTEGER,
    field: 'nonce',
  })
  nonce: string;

  @Column({
    type: DataType.INTEGER,
    field: 'method',
  })
  method: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'state_root',
  })
  stateRoot: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'exit_code',
  })
  exitCode: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'gas_used',
  })
  gasUsed: string;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
    field: 'parent_base_fee',
  })
  parentBaseFee: string;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
    field: 'base_fee_burn',
  })
  baseFeeBurn: string;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
    field: 'over_estimation_burn',
  })
  overEstimationBurn: string;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
    field: 'miner_penalty',
  })
  minerPenalty: string;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
    field: 'miner_tip',
  })
  minerTip: string;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
    field: 'refund',
  })
  refund: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'gas_refund',
  })
  gasRefund: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'gas_burned',
  })
  gasBurned: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'height',
  })
  height: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'actor_name',
  })
  actorName: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'actor_family',
  })
  actorFamily: string;
}
