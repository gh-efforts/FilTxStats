import * as EventEmitter from 'events';

let ee = new EventEmitter();

export const MINER_CREATED = 'miner_created';
export const MINER_UPDATED = 'miner_updated';
export const MINER_DELETED = 'miner_deleted';

export default ee;
