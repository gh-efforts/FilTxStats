import {
  FilcoinNetworkDataEntity,
  FilcoinNetworkDataMapping,
} from '@dws/entity';

import * as _ from 'lodash';

import { FilscanSdk } from '@filscan/http';
import { Config, Init, Inject, Provide } from '@midwayjs/core';
import { BaseService } from '../../core/baseService';

@Provide()
export class FilcoinNetworkService extends BaseService<FilcoinNetworkDataEntity> {
  @Inject()
  mapping: FilcoinNetworkDataMapping;

  @Config('filscanConfig.url')
  filscanUrl;

  private filscan: FilscanSdk;

  @Init()
  async initMethod() {
    this.filscan = new FilscanSdk(this.filscanUrl);
  }

  async getNetworkData() {
    try {
      const data = await this.filscan.getFilcoinNetworkData();
      const camelCase = {};
      Object.keys(data).forEach(key => {
        camelCase[_.camelCase(key)] = data[key];
      });
      return camelCase;
    } catch (error) {
      this.ctx.logger.error('network error', error);
      return this.mapping.getFilNetwork({
        order: [['createdAt', 'desc']],
      });
    }
  }
}
