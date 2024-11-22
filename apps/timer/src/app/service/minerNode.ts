import { Config, Init, Inject, Provide, Logger } from '@midwayjs/core';

import { MinerMapping, MinerNodeEntity, MinerNodeMapping } from '@dws/entity';
import { FilfoxSdk } from '@filfox/http';
import { ParsedMessagesMapping } from '@lily/entity';
import { LotusSdk } from '@lotus/http';
import { Op } from 'sequelize';
import { BaseService } from '../../core/baseService';
import { MINER_NODE_STATUS, MINER_NODE_TYPE } from '../comm/miner';
import { ILogger } from '@midwayjs/logger';
import { PixiuSdk } from '@pixiu/http';

@Provide()
export class MinerNodeService extends BaseService<MinerNodeEntity> {
  @Inject()
  mapping: MinerNodeMapping;

  @Inject()
  minerMapping: MinerMapping;

  @Inject()
  lilyParsedMessagesMapping: ParsedMessagesMapping;

  @Config('pixiuConfig.url')
  pixiuUrl;

  @Config('lotusConfig')
  lotusConfig: {
    url: string;
    token: string;
  };

  @Config('filfoxConfig.url')
  filfoxUrl;

  @Logger()
  logger: ILogger;

  filfox: FilfoxSdk;

  lotus: LotusSdk;

  pixiu: PixiuSdk;

  @Init()
  async initMethod() {
    this.lotus = new LotusSdk(this.lotusConfig.url, this.lotusConfig.token);
    this.filfox = new FilfoxSdk(this.filfoxUrl);
    this.pixiu = new PixiuSdk(this.pixiuUrl);
  }

  async getMinerIds() {
    return this.minerMapping.getMinerList().then(res => {
      return res.map(item => item.miner);
    });
  }

  public async getAllAddresses(
    params: Partial<MinerNodeEntity> = {}
  ): Promise<string[]> {
    const where = this.returnWhere(params);

    const miners = await this.mapping.findAllMinerNode({
      attributes: ['name', 'robustAddress'],
      group: ['name'],
      where,
    });

    return [].concat(...miners.map(miner => [miner.name, miner.robustAddress]));
  }

  // 定时查询miner_node表，把没有短地址或者长地址的补全
  public async syncNameAndRobustAddress() {
    // TODO 速度可能有点慢，需要优化
    console.time('syncNameAndRobustAddress');
    await Promise.all([this._syncName(), this._syncRobustAddress()]);
    console.timeEnd('syncNameAndRobustAddress');
  }

  private async _syncName() {
    const noNames = await this.mapping.findAllMinerNode({
      where: {
        name: '',
        robustAddress: {
          [Op.ne]: '',
        },
      },
      attributes: ['id', 'robustAddress'],
    });
    const IDRes = await Promise.all(
      noNames.map(item => {
        const { robustAddress } = item;
        return this.lotus.stateLookupID(robustAddress);
      })
    );
    await Promise.all(
      IDRes.map(async item => {
        const { name, robustAddress } = item;
        //加了唯一键之后，有可能update重复, 直接不处理即可
        try {
          await this.mapping.modifyMinerNode(
            { name },
            { where: { robustAddress } }
          );
        } catch (e) {
          this.logger.info(`ignore error:%s,%s`, name, robustAddress);
        }
        return true;
      })
    );
  }

  private async _syncRobustAddress() {
    const noRobustAddresses = await this.mapping.findAllMinerNode({
      where: {
        robustAddress: '',
        name: {
          [Op.ne]: '',
        },
      },
      attributes: ['id', 'name'],
    });
    const robustAddressRes = await Promise.all(
      noRobustAddresses.map(item => {
        const { name } = item;
        return this.lotus.stateLookupRobustAddress(name);
      })
    );
    await Promise.all(
      robustAddressRes.map(async item => {
        const { name, robustAddress } = item;
        //加了唯一键之后，有可能update重复, 直接不处理即可
        try {
          await this.mapping.modifyMinerNode(
            { robustAddress },
            { where: { name } }
          );
        } catch (e) {
          this.logger.info(`ignore error:%s,%s`, name, robustAddress);
        }
        return true;
      })
    );
  }

  public async saveNodes(miner: string) {
    const minerStaticState = await this.pixiu.getMinerStaticState([miner]);

    if (minerStaticState.length == 0) {
      return;
    }

    const minerInfo = minerStaticState[0];

    const minerNodeData = [];

    if (minerInfo.worker?.id) {
      minerNodeData.push({
        minerName: miner,
        type: MINER_NODE_TYPE.WORKER,
        name: this.utils.returnName(minerInfo.worker?.id),
        robustAddress: this.utils.returnRobustAddress(
          minerInfo.worker?.address
        ),
        status: MINER_NODE_STATUS.ON,
        height: 0,
      });
    }

    if (minerInfo.owner?.id) {
      minerNodeData.push({
        minerName: miner,
        type: MINER_NODE_TYPE.OWNER,
        name: this.utils.returnName(minerInfo.owner?.id),
        robustAddress: this.utils.returnRobustAddress(minerInfo.owner?.address),
        status: MINER_NODE_STATUS.ON,
        height: 0,
      });
    }

    if (minerInfo.controller && minerInfo.controller.length > 0) {
      minerInfo.controller.forEach(controller => {
        minerNodeData.push({
          minerName: miner,
          type: MINER_NODE_TYPE.CONTROL,
          name: this.utils.returnName(controller?.id),
          robustAddress: this.utils.returnRobustAddress(controller?.address),
          status: MINER_NODE_STATUS.ON,
          height: 0,
        });
      });
    }

    await this.mapping.bulkCreateMinerNode(minerNodeData, {
      ignoreDuplicates: true,
    });
  }

  public async updateNodes() {
    const miners = await this.getMinerIds();

    Promise.all(
      miners.map(miner => {
        return this._updateMinerNodes(miner);
      })
    );
  }

  private async _updateMinerNodes(miner: string) {
    const [minerStaticState, minerNodes] = await Promise.all([
      this.pixiu.getMinerStaticState([miner]),
      this.mapping.findAllMinerNode({
        where: { minerName: miner, status: MINER_NODE_STATUS.ON },
      }),
    ]);

    if (minerStaticState.length == 0) {
      return;
    }

    const minerInfo = minerStaticState[0];

    const nowMinerNodes = this._diffMinerNodes(minerNodes);

    // 判断work是否更新
    if (minerInfo.worker?.id != nowMinerNodes.worker?.name) {
      Promise.all([
        nowMinerNodes.worker
          ? this.mapping.modifyMinerNode(
              { status: MINER_NODE_STATUS.OFF },
              { where: { id: nowMinerNodes.worker.id } }
            )
          : null,
        minerInfo.worker?.id
          ? this.mapping.getModel().create({
              minerName: miner,
              type: MINER_NODE_TYPE.WORKER,
              name: this.utils.returnName(minerInfo.worker?.id),
              robustAddress: this.utils.returnRobustAddress(
                minerInfo.worker?.address
              ),
              status: MINER_NODE_STATUS.ON,
              height: 0,
            })
          : null,
      ]);
    }

    // 判断owner是否更新
    if (minerInfo.owner?.id != nowMinerNodes.owner?.name) {
      Promise.all([
        nowMinerNodes.owner
          ? this.mapping.modifyMinerNode(
              { status: MINER_NODE_STATUS.OFF },
              { where: { id: nowMinerNodes.owner.id } }
            )
          : null,
        minerInfo.owner?.id
          ? this.mapping.getModel().create({
              minerName: miner,
              type: MINER_NODE_TYPE.OWNER,
              name: this.utils.returnName(minerInfo.owner?.id),
              robustAddress: this.utils.returnRobustAddress(
                minerInfo.owner?.address
              ),
              status: MINER_NODE_STATUS.ON,
              height: 0,
            })
          : null,
      ]);
    }

    // 判断controller是否更新
    await this.mapping.modifyMinerNode(
      { status: MINER_NODE_STATUS.OFF },
      { where: { minerName: miner, type: MINER_NODE_TYPE.CONTROL } }
    );

    if (minerInfo.controller && minerInfo.controller.length > 0) {
      minerInfo.controller.forEach(controller => {
        if (nowMinerNodes.controller[controller.id]) {
          this.mapping.modifyMinerNode(
            {
              status: MINER_NODE_STATUS.ON,
            },
            { where: { id: nowMinerNodes.controller[controller.id].id } }
          );
        } else {
          this.mapping.getModel().create({
            minerName: miner,
            type: MINER_NODE_TYPE.CONTROL,
            name: this.utils.returnName(controller?.id),
            robustAddress: this.utils.returnRobustAddress(controller?.address),
            status: MINER_NODE_STATUS.ON,
            height: 0,
          });
        }
      });
    }
  }

  // 区分miner下各种类型的节点
  private _diffMinerNodes(minerNodes: MinerNodeEntity[]) {
    const nodes: {
      worker?: MinerNodeEntity;
      owner?: MinerNodeEntity;
      controller: Record<string, MinerNodeEntity>;
    } = { controller: {} };

    minerNodes.forEach(minerNode => {
      switch (minerNode.type) {
        case MINER_NODE_TYPE.WORKER:
          nodes.worker = minerNode;
          break;
        case MINER_NODE_TYPE.OWNER:
          nodes.owner = minerNode;
          break;
        case MINER_NODE_TYPE.CONTROL:
          nodes.controller[minerNode.name] = minerNode;
          break;
      }
    });

    return nodes;
  }
}
