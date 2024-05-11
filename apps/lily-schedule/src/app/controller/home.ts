import { Controller, Get, Inject } from '@midwayjs/core';
import { MinerService } from '../service/miner';
import { LilyMapping } from '@lily/entity';

@Controller('/')
export class HomeController {
  @Inject()
  minerService: MinerService;

  @Inject()
  lilyMapping: LilyMapping;

  @Get('/')
  async home() {
    return 'Hello Midwayjs!';
  }

  @Get('/test')
  async testEncapsulation() {
    await this.minerService.syncMinersByEncapsulation({
      miners: ['f01135819'],
      startAt: '2024-05-10 00:00:00',
      endAt: '2024-05-10 23:59:59',
    });

    //['f01135819', 'f02956073', 'f03028412']

    // let ret = await this.lilyMapping.getLilyMinerPledgeIncr(
    //   'f01135819',
    //   '2024-05-10 00:00:00',
    //   '2024-05-10 23:59:59'
    // );
    // console.log('===', ret);
  }
}
