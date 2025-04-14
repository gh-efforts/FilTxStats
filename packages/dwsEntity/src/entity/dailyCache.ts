import { Column, DataType, Model, Table } from 'sequelize-typescript';
// import ee, { MINER_CREATED, MINER_DELETED, MINER_UPDATED } from '../ee/ee';

@Table({
  tableName: 'daily_cache',
  timestamps: false,
  paranoid: false,
  indexes: [
    {
      name: 'PRIMARY',
      unique: true,
      using: 'BTREE',
      fields: [{ name: 'id' }],
    },
  ],
})
export class DailyCacheEntity extends Model {
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
    field: 'data_key',
  })
  dataKey: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'data_height',
  })
  dataHeight: number;

  @Column({
    type: DataType.JSON,
    allowNull: false,
    field: 'data_json',
  })
  dataJson: object;
}

/**

 drop table if EXISTS `daily_cache`;
 create table `daily_cache` (
 `id` int auto_increment,
 `data_key` varchar(500) not null comment '数据 key',
 `data_height` int not null comment '数据高度',
 `data_json` json default null comment '数据存储',
 primary key (`id`),
 unique key `uk_key_height`(`data_key`, `data_height`)
) engine='innodb' charset=utf8mb4;

 */
