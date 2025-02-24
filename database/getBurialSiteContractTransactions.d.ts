import type { PoolConnection } from 'better-sqlite-pool';
import type { BurialSiteContractTransaction } from '../types/recordTypes.js';
export default function GetBurialSiteContractTransactions(burialSiteContractId: number | string, options: {
    includeIntegrations: boolean;
}, connectedDatabase?: PoolConnection): Promise<BurialSiteContractTransaction[]>;
