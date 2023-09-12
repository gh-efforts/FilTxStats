import { LarkSdk } from '@lark/core';
import { Provide } from '@midwayjs/core';
import { InjectDataSource } from '@midwayjs/sequelize';
import { QueryTypes, Sequelize } from 'sequelize';

@Provide()
export class LilyService {
  // 注入自定义数据源
  @InjectDataSource('lily')
  lilySource: Sequelize;

  lark: LarkSdk;

  constructor() {
    this.lark = new LarkSdk();
  }

  async query<T extends object>(
    SQL: string,
    replacements: { [key: string]: unknown } | unknown[],
    plain: boolean = false,
    errorMsg: string[] = [],
    errorCount: number = 0
  ): Promise<T> {
    try {
      return (await this.lilySource.query<T>(SQL, {
        type: QueryTypes.SELECT,
        replacements,
        plain,
        raw: true,
      })) as any;
    } catch (e) {
      const message = (e as Error).message;
      console.log('error', `Lily 查询 ${SQL} 出错：${message}`);
      errorMsg.push(`Lily 查询 ${SQL} 出错：${message}`);

      if (errorCount >= 3) {
        // await this.lark.larkNotify(errorMsg.join('\n'));
        // TODO send to lark
        throw new Error(JSON.stringify(errorMsg));
      }
      return this.query(SQL, replacements, plain, errorMsg, errorCount + 1);
    }
  }
}
