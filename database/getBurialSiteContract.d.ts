import type { PoolConnection } from 'better-sqlite-pool';
import type { BurialSiteContract } from '../types/recordTypes.js';
export default function getBurialSiteContract(burialSiteContractId: number | string, connectedDatabase?: PoolConnection): Promise<BurialSiteContract | undefined>;
