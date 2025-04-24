import type { PoolConnection } from 'better-sqlite-pool';
import type { ContractField } from '../types/record.types.js';
export default function getContractField(contractId: number | string, connectedDatabase?: PoolConnection): Promise<ContractField[]>;
