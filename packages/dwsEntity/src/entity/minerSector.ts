import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'miner_sector',
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
      name: 'idx_miner_date',
      using: 'BTREE',
      fields: [{ name: 'miner' }, { name: 'date_at' }],
    },
  ],
})
export class MinerSectorEntity extends Model {
  @Column({
    autoIncrement: true,
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    comment: '自增主键 id',
  })
  id: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    comment: '节点号',
  })
  miner: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '新增扇区数',
    field: 'sector_seal_count',
  })
  sectorSealCount: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '正常扇区数',
    field: 'correct_sector_count',
  })
  correctSectorCount: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '错误扇区数',
    field: 'error_sector_count',
  })
  errorSectorCount: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '恢复中扇区数',
    field: 'reverting_in_sector_count',
  })
  revertingInSectorCount: number;

  @Column({
    type: DataType.DECIMAL(38, 0),
    allowNull: false,
    comment: '扇区质押',
    field: 'initial_pledge',
  })
  initialPledge: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '过期扇区数',
    field: 'stale_dated_sector_count',
  })
  staleDatedSectorCount: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '续期扇区',
    field: 'renew_sector_count',
  })
  renewSectorCount: number;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
    comment: '天',
    field: 'date_at',
  })
  dateAt: string;
}
