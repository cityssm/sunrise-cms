import type { PoolConnection } from 'better-sqlite-pool';
import type { ContractTransaction } from '../types/record.types.js';
export default function GetContractTransactions(contractId: number | string, options: {
    includeIntegrations: boolean;
}, connectedDatabase?: PoolConnection): Promise<ContractTransaction[]>;
