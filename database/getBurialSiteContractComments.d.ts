import type { PoolConnection } from 'better-sqlite-pool';
import type { BurialSiteContractComment } from '../types/recordTypes.js';
export default function getBurialSiteContractComments(burialSiteContractId: number | string, connectedDatabase?: PoolConnection): Promise<BurialSiteContractComment[]>;
