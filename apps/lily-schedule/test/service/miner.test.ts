import { relative } from 'path';
import * as assert from 'assert';

import { testConfig } from '../root.config';
import { MinerService } from '../../src/app/service/insight/miner';

const filename = relative(process.cwd(), __filename).replace(/\\/gu, '/');

describe(filename, () => {
  let minerService: MinerService;
  let minerName: string = 'f01878005';

  before(async () => {
    minerService = await testConfig.app
      .getApplicationContext()
      .getAsync<MinerService>(MinerService);
  });

  after(async () => {
    if (minerName) {
      await minerService.removeMiner({ names: [minerName] });
    }
  });

  it('getMinerList test', async () => {
    const res = await minerService.getPage({ page: 1, limit: 10 });
    assert(res);
  });

  it('add miner test', async () => {
    const res = await minerService.addMiner({ name: minerName });
    assert(res);
  });
});
