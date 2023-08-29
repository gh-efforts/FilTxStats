import { ALL, Body, Controller, Inject, Post } from '@midwayjs/core';
import { QueryBuilderDTO } from '../model/dto/queryBuilder';
import { QueryBuilderService } from '../service/queryBuilder';

@Controller('/query')
export class QueryBuilderController {
  @Inject()
  service: QueryBuilderService;

  @Post('/builder')
  async queryBuilder(@Body(ALL) params: QueryBuilderDTO) {
    return this.service.queryBuilder(params);
  }
}
