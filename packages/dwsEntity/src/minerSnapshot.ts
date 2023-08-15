import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'miner_snapshot',
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
    name: "idx_miner_name",
    using: "BTREE",
    fields: [
     { name: "miner_name" },
    ]
   },
  ]
})
export class MinerSnapshotEntity extends Model {
  @Column({
   autoIncrement: true,
   type: DataType.INTEGER.UNSIGNED,
   allowNull: false,
   primaryKey: true
  })
  id: number;

  @Column({
   type: DataType.STRING(32),
   allowNull: false,
   defaultValue: "",
   comment: "miner表name",
   field: 'miner_name'
  })
  minerName: string;

  @Column({
   type: DataType.DECIMAL(32,0),
   allowNull: true,
   defaultValue: 0,
   comment: "有效算力，单位byte"
  })
  power: number;

  @Column({
   type: DataType.DECIMAL(30,18),
   allowNull: false,
   defaultValue: 0.000000000000000000,
   comment: "余额，单位fil"
  })
  balance: number;

  @Column({
   type: DataType.DECIMAL(30,18),
   allowNull: false,
   defaultValue: 0.000000000000000000,
   comment: "扇区质押币，单位fil"
  })
  pledge: number;

  @Column({
   type: DataType.DECIMAL(30,18),
   allowNull: false,
   defaultValue: 0.000000000000000000,
   comment: "锁仓资产，单位fil",
   field: 'lock_funds'
  })
  lockFunds: number;

  @Column({
   type: DataType.DATEONLY,
   allowNull: false,
   comment: "日期",
   field: 'date_at'
  })
  dateAt: string;
}