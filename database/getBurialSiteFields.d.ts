import type { PoolConnection } from 'better-sqlite-pool';
import type { BurialSiteField } from '../types/recordTypes.js';
export default function getBurialSiteFields(burialSiteId: number | string, connectedDatabase?: PoolConnection): Promise<BurialSiteField[]>;
