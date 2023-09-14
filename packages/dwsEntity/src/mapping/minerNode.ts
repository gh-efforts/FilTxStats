import { Provide } from '@midwayjs/decorator';

import { MinerNodeEntity } from '@dws/entity';

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
}
