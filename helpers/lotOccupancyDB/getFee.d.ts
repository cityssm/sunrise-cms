import type { PoolConnection } from 'better-sqlite-pool';
import type * as recordTypes from '../../types/recordTypes';
export declare function getFee(feeId: number | string, connectedDatabase?: PoolConnection): Promise<recordTypes.Fee>;
export default getFee;
