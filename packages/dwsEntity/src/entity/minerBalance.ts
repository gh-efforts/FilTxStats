import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'miner_balance',
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
    name: "idx_miner_date",
    using: "BTREE",
    fields: [
     { name: "miner" },
     { name: "date_at" },
    ]
   },
  ]
})
export class MinerBalanceEntity extends Model {
  @Column({
   type: DataType.INTEGER,
   allowNull: false,
   primaryKey: true,
   comment: "自增主键 id"
  })
  id: number;

  @Column({
   type: DataType.STRING(255),
   allowNull: false,
   comment: "节点号"
  })
  miner: string;

  @Column({
   type: DataType.DECIMAL(38,0),
   allowNull: false,
   comment: "Miner 账户余额"
  })
  balance: number;

  @Column({
   type: DataType.DECIMAL(38,0),
   allowNull: false,
   comment: "owner 余额"
  })
  owner: number;

  @Column({
   type: DataType.DECIMAL(38,0),
   allowNull: false,
   comment: "worker 余额"
  })
  worker: number;

  @Column({
   type: DataType.DECIMAL(38,0),
   allowNull: false,
   comment: "Controller 余额"
  })
  c0: number;

  @Column({
   type: DataType.DECIMAL(38,0),
   allowNull: false,
   comment: "Controller 余额"
  })
  c1: number;

  @Column({
   type: DataType.DECIMAL(38,0),
   allowNull: false,
   comment: "Controller 余额"
  })
  c2: number;

  @Column({
   type: DataType.DECIMAL(38,0),
   allowNull: false,
   comment: "benf 余额"
  })
  beneficaiary: number;

  @Column({
   type: DataType.DECIMAL(38,0),
   allowNull: false,
   comment: "market 余额"
  })
  market: number;

  @Column({
   type: DataType.DATEONLY,
   allowNull: false,
   comment: "时间",
   field: 'date_at'
  })
  dateAt: string;
}