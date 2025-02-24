import type { PoolConnection } from 'better-sqlite-pool';
import type { BurialSiteComment } from '../types/recordTypes.js';
export default function getBurialSiteComments(burialSiteId: number | string, connectedDatabase?: PoolConnection): Promise<BurialSiteComment[]>;
