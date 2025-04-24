import type { PoolConnection } from 'better-sqlite-pool';
import type { ContractInterment } from '../types/record.types.js';
export default function getContractInterments(contractId: number | string, connectedDatabase?: PoolConnection): Promise<ContractInterment[]>;
