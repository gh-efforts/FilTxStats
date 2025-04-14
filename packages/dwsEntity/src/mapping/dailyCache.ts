import { Provide } from '@midwayjs/core';
import { DailyCacheEntity } from '../entity/dailyCache';

@Provide()
export class DailyCacheMapping {
  getModel() {
    return DailyCacheEntity;
  }
}
