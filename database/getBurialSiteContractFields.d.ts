import type { PoolConnection } from 'better-sqlite-pool';
import type { BurialSiteContractField } from '../types/recordTypes.js';
export default function getBurialSiteContractField(burialSiteContractId: number | string, connectedDatabase?: PoolConnection): Promise<BurialSiteContractField[]>;
