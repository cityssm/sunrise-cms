import type { PoolConnection } from 'better-sqlite-pool';
import type { Cemetery } from '../types/recordTypes.js';
export default function getCemetery(cemeteryId: number | string, connectedDatabase?: PoolConnection): Promise<Cemetery | undefined>;
