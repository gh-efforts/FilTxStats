import { Provide } from '@midwayjs/core';
import { MessagesEntity } from '../entity/messages';

@Provide()
export class MessagesMapping {
  getModel() {
    return MessagesEntity;
  }
}
