// 导出数据库所有表的 Entity 类
import { MinerEntity } from './src/entity/miner';
import { MinerDailyStatsEntity } from './src/entity/minerDailyStats';
import { MinerReleaseRecordEntity } from './src/entity/minerReleaseRecord';
import { MinerRewardReleaseEntity } from './src/entity/minerRewardRelease';
import { MinerSnapshotEntity } from './src/entity/minerSnapshot';

import { MinerMapping } from './src/mapping/miner';
import { MinerSnapshotMapping } from './src/mapping/minerSnapshot';

export {
  MinerDailyStatsEntity,
  MinerEntity,
  MinerMapping,
  MinerReleaseRecordEntity,
  MinerRewardReleaseEntity,
  MinerSnapshotEntity,
  MinerSnapshotMapping,
};
