import { Provide } from '@midwayjs/decorator';
import { Op } from 'sequelize';

import { WalletEntity, WalletTypeEntity } from '@dws/entity';

@Provide()
export class WalletMapping {
  getModel() {
    return WalletEntity;
  }

  public async getAllForCache() {
    const rows = await this.getModel().findAll({
      where: {
        name: {
          [Op.ne]: 'f0',
        },
      },
      include: [
        {
          model: WalletTypeEntity,
          attributes: ['id', 'name'],
        },
      ],
    });
    const res: Record<string, string> = {};
    rows.forEach(row => {
      const { name, robustAddress, walletType } = row;
      res[name] = walletType.name;
      res[robustAddress] = walletType.name;
    });
    return res;
  }

  async getMaxHeight(options = {}) {
    const res = await this.getModel().max('height', options);
    return (res || 0) as number;
  }

  public async getPage(
    page: number,
    limit: number,
    where: Partial<WalletEntity> = {}
  ) {
    const offset = (page - 1) * limit;

    const res = await this.getModel().findAndCountAll({
      where,
      limit,
      offset: offset > 0 ? offset : 0,
      order: [['id', 'desc']],
      include: [
        {
          model: WalletTypeEntity,
          attributes: ['id', 'name'],
        },
      ],
    });

    return res;
  }
}
