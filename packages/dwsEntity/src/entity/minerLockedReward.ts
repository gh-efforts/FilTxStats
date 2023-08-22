import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'miner_locked_reward',
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      name: 'PRIMARY',
      unique: true,
      using: 'BTREE',
      fields: [{ name: 'id' }],
    },
  ],
})
export class MinerLockedRewardEntity extends Model {
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
    comment: '总共锁仓的奖励，单位fil',
    field: 'locked_reward',
  })
  lockedReward: string;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
    comment: '每天释放金额，单位fil',
    field: 'daily_reward',
  })
  dailyReward: string;

  @Column({
    type: DataType.TIME,
    allowNull: false,
    comment: '锁仓奖励开始释放的时间',
    field: 'time',
  })
  time: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '锁仓奖励开始释放的高度',
    field: 'height',
  })
  height: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '奖励开始释放的小时数',
    field: 'hour',
  })
  hour: number;

  @Column({
    type: DataType.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '0未完成，1完成',
    field: 'is_completed',
  })
  isCompleted: number;
}
