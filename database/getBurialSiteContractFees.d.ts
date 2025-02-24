import type { PoolConnection } from 'better-sqlite-pool';
import type { BurialSiteContractFee } from '../types/recordTypes.js';
export default function getBurialSiteContractFees(burialSiteContractId: number | string, connectedDatabase?: PoolConnection): Promise<BurialSiteContractFee[]>;
