import { Column, DataType, Model, Table } from 'sequelize-typescript';
import ee, { MINER_CREATED, MINER_DELETED, MINER_UPDATED } from '../ee/ee';

@Table({
  tableName: 'miner',
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
      name: 'idx_miner_address',
      unique: true,
      using: 'BTREE',
      fields: [{ name: 'miner' }, { name: 'address' }],
    },
  ],
  hooks: {
    /**
     * miner 各种钩子
     * 用来同步 insight 的数据
     * @param miner
     */

    afterCreate: (ins: MinerEntity, options?: any) => {
      console.log('call afterCreateCb');
      ee.emit(MINER_CREATED, ins);
    },
    afterUpsert: (attrs: [MinerEntity, boolean | null], fn?: unknown) => {
      console.log('call afterUpsertCb');
      ee.emit(MINER_CREATED, attrs && attrs[0]);
    },
    afterUpdate: (ins: MinerEntity, options?: any) => {
      console.log('call afterUpdateCb');
      ee.emit(MINER_UPDATED, ins);
    },
    afterDestroy: (ins: MinerEntity, options?: any) => {
      console.log('call afterDestroyCb');
      ee.emit(MINER_DELETED, ins);
    },
  },
})
export class MinerEntity extends Model {
  @Column({
    autoIncrement: true,
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING(32),
    allowNull: false,
    comment: '节点名称，短地址',
  })
  miner: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    defaultValue: '',
    comment: '长地址',
  })
  address: string;

  @Column({
    type: DataType.TINYINT,
    defaultValue: '1',
    comment: '数据类型 1-DC 2-CC',
    field: 'data_type',
  })
  dataType: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: '1',
    comment: '节点业务类型',
    field: 'type_id',
  })
  typeId: number;

  @Column({
    type: DataType.DECIMAL(32, 0),
    allowNull: true,
    defaultValue: 0,
    comment: '扇区大小，单位byte',
    field: 'sector_size',
  })
  sectorSize: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '是否同步过奖励历史数据',
    field: 'is_sync_reward_history',
  })
  isSyncRewardHistory: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: '区块奖励结束时间',
    field: 'reward_end_at',
  })
  rewardEndAt: string;
}
