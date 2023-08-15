import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'miner_reward_release',
  timestamps: true,
  paranoid: true,
  indexes: [
   {
    name: "PRIMARY",
    unique: true,
    using: "BTREE",
    fields: [
     { name: "id" },
    ]
   },
   {
    name: "idx_date_at",
    using: "BTREE",
    fields: [
     { name: "date_at" },
    ]
   },
  ]
})
export class MinerRewardReleaseEntity extends Model {
  @Column({
   autoIncrement: true,
   type: DataType.INTEGER.UNSIGNED,
   allowNull: false,
   primaryKey: true,
   comment: "主键id"
  })
  id: number;

  @Column({
   type: DataType.STRING(32),
   allowNull: false,
   defaultValue: "",
   comment: "miner"
  })
  miner: string;

  @Column({
   type: DataType.DECIMAL(30,18),
   allowNull: false,
   defaultValue: 0.000000000000000000,
   comment: "总共锁仓的奖励",
   field: 'lock_reward'
  })
  lockReward: number;

  @Column({
   type: DataType.DECIMAL(30,18),
   allowNull: false,
   defaultValue: 0.000000000000000000,
   comment: "每天释放金额",
   field: 'daily_reward'
  })
  dailyReward: number;

  @Column({
   type: DataType.DATEONLY,
   allowNull: false,
   comment: "奖励开始释放日期",
   field: 'date_at'
  })
  dateAt: string;

  @Column({
   type: DataType.TINYINT.UNSIGNED,
   allowNull: false,
   defaultValue: 0,
   comment: "0未完成，1完成",
   field: 'is_completed'
  })
  isCompleted: number;
}