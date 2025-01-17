import { LarkSdk } from '@lark/core';
import { Provide } from '@midwayjs/core';
import { InjectDataSource } from '@midwayjs/sequelize';
import { QueryTypes, Sequelize } from 'sequelize';

@Provide()
export class LilyMessagesService {
  // 注入自定义数据源
  @InjectDataSource('lilyMessages')
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
        // logging: console.log,
      })) as any;
    } catch (e) {
      const message = (e as Error).message;
      console.log('error', `LilyMessages 查询 ${SQL} 出错：${message}`);
      errorMsg.push(`LilyMessages 查询 ${SQL} 出错：${message}`);

      if (errorCount >= 3) {
        await this.lark.sendLarkByQueueStatus(
          'lily 查询',
          false,
          errorMsg.join('\n')
        );
        return;
      }
      return this.query(SQL, replacements, plain, errorMsg, errorCount + 1);
    }
  }
}
