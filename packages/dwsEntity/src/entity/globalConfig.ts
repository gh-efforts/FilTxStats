import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'global_config',
  timestamps: false,
  paranoid: false,
})
export class GlobalConfigEntity extends Model {
  @Column({
    autoIncrement: true,
    type: DataType.INTEGER({ length: 11, unsigned: true }),
    allowNull: false,
    primaryKey: true,
    comment: '主键',
    field: 'id',
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: '配置名称',
    field: 'name',
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: '值',
    field: 'value',
  })
  value: string;
}
