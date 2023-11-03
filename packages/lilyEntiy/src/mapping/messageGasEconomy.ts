import { Provide } from '@midwayjs/core';
import { MessaggeGasEconomyEntity } from '../entity/messageGasEconomy';

@Provide()
export class MessageGasEconomyMapping {
  getModel() {
    return MessaggeGasEconomyEntity;
  }

  /**
   * 获得最大 fee
   * @returns
   */
  public async getMasHeightBaseFee(): Promise<MessaggeGasEconomyEntity | null> {
    let ret = await this.getModel().findOne({
      order: [['height', 'desc']],
    });
    return ret;
  }
}
