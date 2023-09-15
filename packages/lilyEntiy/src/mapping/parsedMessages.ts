import { Provide } from '@midwayjs/core';

import { ParsedMessagesEntity } from '@lily/entity';
import { Op } from 'sequelize';
@Provide()
export class ParsedMessagesMapping {
  getModel() {
    return ParsedMessagesEntity;
  }

  async getChangeMessage(
    minerName: string | string[],
    startHeight: number,
    method: string | string[] = ['ChangeWorkerAddress', 'ChangeOwnerAddress']
  ) {
    return this.getModel().findAll({
      where: {
        height: {
          [Op.gt]: startHeight,
        },
        to: minerName,
        method,
      },
      attributes: ['to', 'height', 'params', 'method'],
      order: ['height'],
    });
  }
}
