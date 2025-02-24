import type { PoolConnection } from 'better-sqlite-pool';
import type { BurialSiteContractInterment } from '../types/recordTypes.js';
export default function getBurialSiteContractInterments(burialSiteContractId: number | string, connectedDatabase?: PoolConnection): Promise<BurialSiteContractInterment[]>;
