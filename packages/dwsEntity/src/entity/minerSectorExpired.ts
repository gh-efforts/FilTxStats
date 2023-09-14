import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'miner_sector_expired',
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
      unique: true,
      using: 'BTREE',
      fields: [{ name: 'miner' }, { name: 'date_at' }],
    },
  ],
})
export class MinerSectorExpiredEntity extends Model {
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
    type: DataType.DECIMAL(38, 0),
    allowNull: false,
    comment: '到期算力/原值算力',
  })
  power: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '到期扇区',
    field: 'sector_count',
  })
  sectorCount: number;

  @Column({
    type: DataType.DECIMAL(38, 0),
    allowNull: false,
    comment: '到期质押/FIL',
    field: 'initial_pledge',
  })
  initialPledge: number;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
    comment: '扇区到期日',
    field: 'date_at',
  })
  dateAt: string;
}
