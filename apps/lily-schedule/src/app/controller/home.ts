import { Controller, Get, Inject } from '@midwayjs/core';
import { MinerService } from '../service/miner';
import { LilyMapping } from '@lily/entity';
import { MinerSectorService } from '../service/minerSector';

@Controller('/')
export class HomeController {
  @Inject()
  minerService: MinerService;

  @Inject()
  lilyMapping: LilyMapping;

  @Inject()
  minerSectorService: MinerSectorService;

  @Get('/')
  async home() {
    return 'Hello Midwayjs!';
  }

  @Get('/test')
  async testEncapsulation() {
    // await this.minerService.syncMinersByEncapsulation({
    //   miners: ['f01135819'],
    //   startAt: '2024-05-10 00:00:00',
    //   endAt: '2024-05-10 23:59:59',
    // });

    //['f01135819', 'f02956073', 'f03028412']

    // let ret = await this.lilyMapping.getLilyMinerPledgeIncr(
    //   'f01135819',
    //   '2024-05-10 00:00:00',
    //   '2024-05-10 23:59:59'
    // );
    // console.log('===', ret);

    // let ret = await this.lilyMapping.getFaultedSector(
    //   'f03028412',
    //   '2024-05-09 00:00:00',
    //   '2024-05-09 23:59:59'
    // );

    let sector = await this.minerSectorService.syncMinersSector({
      endAt: '2024-05-09 23:59:59',
    });
    console.log('===', sector);
  }
}
