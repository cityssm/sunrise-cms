import type { PoolConnection } from 'better-sqlite-pool';
import type { Cemetery } from '../types/record.types.js';
export default function getCemetery(cemeteryId: number | string, connectedDatabase?: PoolConnection): Promise<Cemetery | undefined>;
export declare function getCemeteryByKey(cemeteryKey: string, connectedDatabase?: PoolConnection): Promise<Cemetery | undefined>;
