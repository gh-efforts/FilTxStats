import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'miner_encapsulation',
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
export class MinerEncapsulationEntity extends Model {
  @Column({
    autoIncrement: true,
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    comment: '自增 id',
  })
  id: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    comment: '节点',
  })
  miner: string;

  @Column({
    type: DataType.DECIMAL(32, 0),
    allowNull: true,
    defaultValue: 0,
    comment: '扇区大小，单位byte',
    field: 'sector_size',
  })
  sectorSize: number;

  @Column({
    type: DataType.DECIMAL(38, 0),
    allowNull: false,
    comment: '有效算力',
    field: 'quality_adj_power',
  })
  qualityAdjPower: number;

  @Column({
    type: DataType.DECIMAL(38, 0),
    allowNull: false,
    comment: '原值算力',
    field: 'raw_byte_power',
  })
  rawBytePower: number;

  @Column({
    type: DataType.DECIMAL(38, 0),
    allowNull: false,
    comment: '新增质押/FiL',
    field: 'increase_pledge',
  })
  increasePledge: number;

  @Column({
    type: DataType.DECIMAL(38, 0),
    allowNull: false,
    comment: '封装 gas /FiL',
    field: 'encapsulation_gas',
  })
  encapsulationGas: number;

  @Column({
    type: DataType.DECIMAL(38, 0),
    allowNull: false,
    comment: 'WindowPost',
    field: 'window_post',
  })
  windowPost: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '丢块',
    field: 'block_loss',
  })
  blockLoss: number;

  @Column({
    type: DataType.DECIMAL(38, 0),
    allowNull: false,
    comment: '惩罚/FiL',
  })
  penalty: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '错误扇区',
    field: 'faulted_sector',
  })
  faultedSector: number;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
    comment: '天',
    field: 'date_at',
  })
  dateAt: string;
}
