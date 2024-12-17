import { Provide } from '@midwayjs/core';
import { ActorsEntity } from '../entity/actors';

@Provide()
export class ActorsMapping {
  getModel() {
    return ActorsEntity;
  }
}
