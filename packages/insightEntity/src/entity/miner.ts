import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'miner',
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
      name: 'idx_miner_address',
      unique: true,
      using: 'BTREE',
      fields: [{ name: 'miner' }, { name: 'address' }],
    },
  ],
})
export class MinerEntity extends Model {
  @Column({
    autoIncrement: true,
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING(32),
    allowNull: false,
    comment: '节点名称，短地址',
    field: 'miner_name',
  })
  minerName: string;

  @Column({
    type: DataType.ENUM('32', '64'),
    allowNull: true,
    comment: '扇区大小，单位byte',
    field: 'sector_size',
  })
  sectorSize: string;

  @Column({
    type: DataType.ENUM(
      'CLOUD',
      'CLOUD_DATACAP',
      'UNION',
      'DATACAP',
      'CLOUD_UNION',
      'UNION_DATACAP',
      'DATALINE'
    ),
    allowNull: true,
    comment: '类型',
  })
  type: string;
}
