import type { PoolConnection } from 'better-sqlite-pool';
import type { ContractFee } from '../types/record.types.js';
export default function getContractFees(contractId: number | string, connectedDatabase?: PoolConnection): Promise<ContractFee[]>;
