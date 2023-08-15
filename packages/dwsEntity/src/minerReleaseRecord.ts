import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'miner_release_record',
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
  ]
})
export class MinerReleaseRecordEntity extends Model {
  @Column({
   autoIncrement: true,
   type: DataType.INTEGER.UNSIGNED,
   allowNull: false,
   primaryKey: true,
   comment: "主键"
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
   comment: "释放金额",
   field: 'release_fil'
  })
  releaseFil: number;

  @Column({
   type: DataType.DATEONLY,
   allowNull: false,
   comment: "释放日期",
   field: 'date_at'
  })
  dateAt: string;
}