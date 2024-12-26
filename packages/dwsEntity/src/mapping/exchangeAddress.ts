import { Provide } from '@midwayjs/core';
import * as _ from 'lodash';

import { ExchangeAddressEntity } from '@dws/entity';

@Provide()
export class ExchangeAddressMapping {
  getModel() {
    return ExchangeAddressEntity;
  }

  async getObj(key: string = 'address', where = {}) {
    const list = await this.getModel().findAll({ where });

    return _.keyBy(list, key);
  }

  async getExchangeList() {
    const res = await this.getModel().findAll({
      attributes: ['exchange'],
      group: ['exchange'],
    });

    return res.map(it => it.exchange);
  }

  async getAddressList(where = {}) {
    const res = await this.getModel().findAll({
      where,
      attributes: ['address'],
    });

    return res.map(it => it.address);
  }
}
