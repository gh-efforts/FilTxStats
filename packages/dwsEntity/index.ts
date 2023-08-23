// 导出数据库所有表的 Entity 类
import { MinerEntity } from './src/entity/miner';
import { MinerDailyStatsEntity } from './src/entity/minerDailyStats';
import { MinerLockedRewardEntity } from './src/entity/minerLockedReward';
import { MinerReleaseRecordEntity } from './src/entity/minerReleaseRecord';
import { MinerRewardEntity } from './src/entity/minerReward';
import { MinerSnapshotEntity } from './src/entity/minerSnapshot';

import { MinerMapping } from './src/mapping/miner';
import { MinerDailyStatsMapping } from './src/mapping/minerDailyStats';
import { MinerLockedRewardMapping } from './src/mapping/minerLockedReward';
import { MinerReleaseRecordMapping } from './src/mapping/minerReleaseRecord';
import { MinerRewardMapping } from './src/mapping/minerReward';
import { MinerSnapshotMapping } from './src/mapping/minerSnapshot';

export {
  MinerDailyStatsEntity,
  MinerDailyStatsMapping,
  MinerEntity,
  MinerLockedRewardEntity,
  MinerLockedRewardMapping,
  MinerMapping,
  MinerReleaseRecordEntity,
  MinerReleaseRecordMapping,
  MinerRewardEntity,
  MinerRewardMapping,
  MinerSnapshotEntity,
  MinerSnapshotMapping,
};
