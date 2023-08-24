import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'miner_reward',
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
      name: 'idx_miner',
      using: 'BTREE',
      fields: [{ name: 'miner' }],
    },
    {
      name: 'idx_unique',
      unique: true,
      using: 'BTREE',
      fields: [{ name: 'miner' }, { name: 'cid' }, { name: 'height' }],
    },
  ],
})
export class MinerRewardEntity extends Model {
  @Column({
    autoIncrement: true,
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    comment: '主键',
    field: 'id',
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: '节点名称',
    field: 'miner',
  })
  miner: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: '区块id',
    field: 'cid',
  })
  cid: string;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
    comment: '区块奖励，单位fil',
    field: 'reward',
  })
  reward: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '区块奖励高度',
    field: 'height',
  })
  height: number;

  @Column({
    type: DataType.TIME,
    allowNull: false,
    comment: '区块奖励时间',
    field: 'time',
  })
  time: string;
}
