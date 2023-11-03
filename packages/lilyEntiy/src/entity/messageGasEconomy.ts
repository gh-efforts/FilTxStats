import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'message_gas_economy',
  timestamps: false,
  schema: 'public',
})
export class MessaggeGasEconomyEntity extends Model {
  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'state_root',
    primaryKey: true,
  })
  stateRoot: string;

  @Column({
    type: DataType.NUMBER,
    allowNull: false,
    field: 'gas_limit_total',
  })
  gasLimitTotal: number;

  @Column({
    type: DataType.NUMBER,
    allowNull: false,
    field: 'gas_limit_unique_total',
  })
  gasLimitUniqueTotal: number;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
    field: 'base_fee',
  })
  baseFee: number;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
    field: 'base_fee_change_log',
  })
  baseFeeChangeLog: string;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
    field: 'gas_fill_ratio',
  })
  gasFillRatio: string;

  @Column({
    type: DataType.DECIMAL,
    field: 'gas_capacity_ratio',
  })
  gasCapacityRatio: string;

  @Column({
    type: DataType.DECIMAL,
    field: 'gas_waste_ratio',
  })
  gasWasteRatio: string;

  @Column({
    type: DataType.BIGINT,
    field: 'height',
  })
  height: string;
}
