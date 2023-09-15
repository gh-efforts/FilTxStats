import { Provide } from '@midwayjs/decorator';

import { MinerNodeEntity } from '@dws/entity';
import { BulkCreateOptions, FindOptions, UpdateOptions } from 'sequelize';

@Provide()
export class MinerNodeMapping {
  getModel() {
    return MinerNodeEntity;
  }

  public async getAllForCache() {
    const rows = await this.getModel().findAll({
      attributes: ['name', 'robustAddress'],
      group: ['name'],
    });

    const res: Record<string, string> = {};
    rows.forEach(row => {
      const { name, robustAddress } = row;
      res[name] = '节点';
      res[robustAddress] = '节点';
    });
    return res;
  }

  public async findAllMinerNode(options?: FindOptions) {
    return this.getModel().findAll(options);
  }

  public async modifyMinerNode(
    values: { [x: string]: any },
    options: UpdateOptions
  ) {
    return this.getModel().update(values, options);
  }

  public async bulkCreateMinerNode(values: any[], options?: BulkCreateOptions) {
    return this.getModel().bulkCreate(values, options);
  }
}
