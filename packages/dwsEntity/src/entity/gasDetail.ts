import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'gas_detail',
  timestamps: false,
  paranoid: false,
})
export class GasDetailEntity extends Model {
  @Column({
    autoIncrement: true,
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
    comment: '日期',
    field: 'date_at',
  })
  dateAt: string;

  @Column({
    type: DataType.STRING(32),
    allowNull: false,
    comment: '节点名称，短地址',
  })
  miner: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
    field: 'detail',
    comment: 'gas详情',
  })
  detail: {
    minerId: string;
    date: string;
    minerGasDetails: {
      method: number;
      gas_fee: string;
      from: string;
      id: string;
    }[];
    minerPenalty: string;
    PreAndProveBatchBurn: { method: number; gas_fee: string }[];
  };

  @Column({
    type: DataType.DATE,
    allowNull: false,
    comment: '日期',
    field: 'created_at',
  })
  createdAt: string;
}
