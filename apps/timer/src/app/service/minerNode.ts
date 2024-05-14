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

  // public async saveNodes(miner: string) {
  //   // 保存miner的owner、worker、control信息
  //   await Promise.all([
  //     this._saveOwner(miner),
  //     this._saveWorkerAndControl(miner),
  //   ]);
  //   // 补全所有长短地址
  //   await this.syncNameAndRobustAddress();
  //   // 更新地址使用状态
  //   await this._updateStatusToOn([miner]);
  //   // 删除表中重复出现的已弃用的地址
  //   // await this._delOffNode();
  //   // 保存minerNode的长短地址
  //   const allAddresses = await this.getAllAddresses({ minerName: miner });
  //   console.log('allAddresses', allAddresses);
  // }

  // private async _saveOwner(miner: string) {
  //   let changes = await this.filfox.changeOwnerAddress(miner);
  //   if (changes.length === 0) return;
  //   // 获取cid，根据cid获取message信息，从信息中获取参数params
  //   const addrs = await Promise.all(
  //     changes.map(change => {
  //       return this._getOwnerByCid(change);
  //     })
  //   );
  //   const owners = addrs.map(change => {
  //     const { owner, height } = change;
  //     return {
  //       minerName: miner,
  //       type: MINER_NODE_TYPE.OWNER,
  //       name: this.utils.returnName(owner),
  //       robustAddress: this.utils.returnRobustAddress(owner),
  //       status: MINER_NODE_STATUS.OFF,
  //       height,
  //     };
  //   });
  //   this.logger.info('saveOwner.length=', owners && owners.length);
  //   await this.mapping.bulkCreateMinerNode(owners, {
  //     ignoreDuplicates: true,
  //   });
  // }

  /**
   * 更新地址使用状态
   */
  // private async _updateStatusToOn(minerName?: string[]) {
  //   /**
  //    * 1.找出每个类型地址的最大height
  //    * 2.根据height将该地址设置为在使用
  //    */
  //   let where = '';
  //   if (!isEmpty(minerName)) {
  //     where += ` AND miner_name IN ("${minerName.join('","')}") `;
  //   }
  //   await this.mapping.getModel().sequelize.query(
  //     `UPDATE miner_node a,
  //   (
  //     SELECT
  //       miner_name,
  //       type,
  //       max( height ) AS height
  //     FROM
  //       miner_node
  //     WHERE
  //       deleted_at IS NULL ${where}
  //     GROUP BY
  //       miner_name,
  //       type
  //     ) b
  //     SET a.\`status\` = ${MINER_NODE_STATUS.ON}
  //   WHERE
  //     a.miner_name = b.miner_name
  //     AND a.type = b.type
  //     AND a.height = b.height`
  //   );
  // }

  // private async _saveWorkerAndControl(miner: string) {
  //   const changes = await this.filfox.changeWorkerAddress(miner);
  //   console.log('changes', changes);
  //   if (changes.length === 0) return;
  //   // 获取cid，根据cid获取message信息，从信息中获取参数params，然后通过loga接口转换成具体的worker、control地址
  //   const addrs = await Promise.all(
  //     changes.map(change => {
  //       return this._getWorkerAndControlByCid(change, miner);
  //     })
  //   );
  //   const workersAndControls: Partial<MinerNodeEntity>[] = [];
  //   addrs.forEach(({ height, controlAddrs, worker }) => {
  //     workersAndControls.push({
  //       minerName: miner,
  //       type: MINER_NODE_TYPE.WORKER,
  //       name: this.utils.returnName(worker),
  //       robustAddress: this.utils.returnRobustAddress(worker),
  //       status: MINER_NODE_STATUS.OFF,
  //       height,
  //     });
  //     if (!(controlAddrs instanceof Array)) {
  //       controlAddrs = [controlAddrs];
  //     }
  //     [...new Set(controlAddrs)].forEach(control => {
  //       workersAndControls.push({
  //         minerName: miner,
  //         type: MINER_NODE_TYPE.CONTROL,
  //         name: this.utils.returnName(control),
  //         robustAddress: this.utils.returnRobustAddress(control),
  //         status: MINER_NODE_STATUS.OFF,
  //         height,
  //       });
  //     });
  //   });
  //   this.logger.info(
  //     '_saveWorkerAndControl.length=',
  //     workersAndControls && workersAndControls.length
  //   );
  //   await this.mapping.bulkCreateMinerNode(workersAndControls, {
  //     ignoreDuplicates: true,
  //   });
  // }

  // private async _getWorkerAndControlByCid(
  //   change: { cid: string; height: number },
  //   minerName: string
  // ) {
  //   const { cid, height } = change;
  //   let { params } = await this.filfox.getMessage(cid);
  //   // 用0x来判断params是不是hex类型
  //   if (params.startsWith('0x')) {
  //     params = Buffer.from(params.split('0x')[1], 'hex').toString('base64');
  //   }
  //   const res = await this.lotus.stateDecodeParams(minerName, params);
  //   return { height, ...res };
  // }

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

  // private async _getOwnerByCid(change: { cid: string; height: number }) {
  //   const { cid, height } = change;
  //   const { decodedParams } = await this.filfox.getMessage(cid);
  //   return { height, owner: decodedParams };
  // }

  /**
   * 定时查询指定区间的每个miner的change事件，并更新minerNode表
   * 1.需要考虑时间间隔内的多次数据变更
   * 2.定时时间间隔设置为每分钟的第0秒和第30秒 0/30 * * * * *
   */
  // public async syncChangeMessage() {
  //   this.logger.info('syncChangeMessage 开始');
  //   const [minerNames, startHeight] = await Promise.all([
  //     this.getMinerIds(),
  //     this.redisUtils.getString('sync_change_message_start_height'),
  //   ]);
  //   this.logger.info('syncChangeMessage startHeight=%s', startHeight);

  //   const changeMessages =
  //     await this.lilyParsedMessagesMapping.getChangeMessage(
  //       minerNames,
  //       Number(startHeight)
  //     );

  //   if (changeMessages.length === 0) {
  //     this.logger.info('syncChangeMessage 查无changeMessages,', minerNames);
  //     return true;
  //   }
  //   const newStartHeight = changeMessages[changeMessages.length - 1].height;
  //   const dataForOff: TDataForOff = {};

  //   const dataForInsert: Partial<MinerNodeEntity>[] = [];
  //   for (const item of changeMessages) {
  //     const { to, height, method, params } = item;
  //     if (isEmpty(dataForOff[to])) {
  //       dataForOff[to] = new Set();
  //     }
  //     if (method === METHOD.CHANGE_OWNER) {
  //       dataForOff[to].add(MINER_NODE_TYPE.OWNER);
  //       dataForInsert.push({
  //         minerName: to,
  //         height: Number(height),
  //         status: MINER_NODE_STATUS.OFF,
  //         name: this.utils.returnName(params as string),
  //         robustAddress: this.utils.returnRobustAddress(params as string),
  //         type: MINER_NODE_TYPE.OWNER,
  //       });
  //     }
  //     if (method === METHOD.CHANGE_WORKER) {
  //       dataForOff[to].add(MINER_NODE_TYPE.WORKER);
  //       dataForOff[to].add(MINER_NODE_TYPE.CONTROL);

  //       let { NewWorker: newWorker, NewControlAddrs: newControlAddrs } =
  //         params as {
  //           NewWorker: string;
  //           NewControlAddrs: string[];
  //         };

  //       dataForInsert.push({
  //         minerName: to,
  //         height: Number(height),
  //         status: MINER_NODE_STATUS.OFF,
  //         name: this.utils.returnName(newWorker),
  //         robustAddress: this.utils.returnRobustAddress(newWorker),
  //         type: MINER_NODE_TYPE.WORKER,
  //       });
  //       if (!(newControlAddrs instanceof Array)) {
  //         newControlAddrs = [newControlAddrs];
  //       }

  //       [...new Set(newControlAddrs)].forEach(control => {
  //         dataForInsert.push({
  //           minerName: to,
  //           type: MINER_NODE_TYPE.CONTROL,
  //           name: this.utils.returnName(control),
  //           robustAddress: this.utils.returnRobustAddress(control),
  //           status: MINER_NODE_STATUS.OFF,
  //           height: Number(height),
  //         });
  //       });
  //     }
  //   }
  //   this.logger.info(
  //     'syncChangeMessage dataForOff=',
  //     dataForOff && JSON.stringify(dataForOff)
  //   );

  //   // 将发生过change事件的miner的地址状态改为弃用
  //   // 将change事件更新到表中
  //   await Promise.all([
  //     this._updateStatusToOffByChangeMessage(dataForOff),
  //     this.mapping.bulkCreateMinerNode(dataForInsert, {
  //       updateOnDuplicate: ['type'],
  //     }),
  //   ]);
  //   // 补全所有长短地址
  //   await this.syncNameAndRobustAddress();
  //   // 更新地址使用状态
  //   await this._updateStatusToOn();
  //   // 删除表中重复出现的已弃用的地址
  //   // await this._delOffNode();
  //   // 更新redis的height
  //   await this.redisUtils.setValue(
  //     'sync_change_message_start_height',
  //     newStartHeight
  //   );
  //   this.logger.info('syncChangeMessage 完成写入新高速', newStartHeight);
  // }

  // private async _updateStatusToOffByChangeMessage(dataForOff: TDataForOff) {
  //   const updateData: { minerName: string; type: number }[] = [];
  //   for (const key in dataForOff) {
  //     [...dataForOff[key]].forEach(type => {
  //       updateData.push({
  //         minerName: key,
  //         type,
  //       });
  //     });
  //   }

  //   await Promise.all(
  //     updateData.map(data => {
  //       return this.mapping.modifyMinerNode(
  //         { status: MINER_NODE_STATUS.OFF },
  //         {
  //           where: {
  //             minerName: data.minerName,
  //             type: data.type,
  //           },
  //         }
  //       );
  //     })
  //   );
  // }

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
