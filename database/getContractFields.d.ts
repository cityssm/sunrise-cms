import type { PoolConnection } from 'better-sqlite-pool';
import type { ContractField } from '../types/recordTypes.js';
export default function getContractField(contractId: number | string, connectedDatabase?: PoolConnection): Promise<ContractField[]>;
