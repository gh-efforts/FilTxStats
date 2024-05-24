import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'miner_type',
  timestamps: true,
  paranoid: true,
})
export class MinerTypeEntity extends Model {
  @Column({
    autoIncrement: true,
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: '类型名称',
  })
  name: string;
}
