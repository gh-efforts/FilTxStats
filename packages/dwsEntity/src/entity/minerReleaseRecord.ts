import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'miner_release_record',
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
      name: 'idx_unique',
      unique: true,
      using: 'BTREE',
      fields: [
        { name: 'miner' },
        { name: 'cid' },
        { name: 'type' },
        { name: 'timestamp' },
      ],
    },
  ],
})
export class MinerReleaseRecordEntity extends Model {
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
    comment: '释放金额，单位fil',
    field: 'release_fil',
  })
  releaseFil: string;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
    defaultValue: 2,
    comment: '释放奖励类型：1-线性，2-立即',
    field: 'type',
  })
  type: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    comment: '释放日期',
    field: 'date_at',
  })
  dateAt: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '释放的时间戳',
    field: 'timestamp',
  })
  timestamp: number;
}
