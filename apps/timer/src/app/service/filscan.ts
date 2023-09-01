import { Config, Init, Inject, Provide } from '@midwayjs/core';

import { FilscanSdk } from '@filscan/http';
import * as _ from 'lodash';

import {
  FilcoinNetworkDataEntity,
  FilcoinNetworkDataMapping,
} from '@dws/entity';

import { BaseService } from '../../core/baseService';

@Provide()
export class FilScanService extends BaseService<FilcoinNetworkDataEntity> {
  @Inject()
  mapping: FilcoinNetworkDataMapping;

  @Config('filscanConfig.url')
  filscanUrl;

  private filscan: FilscanSdk;

  @Init()
  async initMethod() {
    this.filscan = new FilscanSdk(this.filscanUrl);
  }

  async syncFilcoinNetworkData() {
    const data = await this.filscan.getFilcoinNetworkData();
    const camelCase = {};
    Object.keys(data).forEach(key => {
      camelCase[_.camelCase(key)] = data[key];
    });
    return this.mapping.addFilNetwork(camelCase);
  }
}
