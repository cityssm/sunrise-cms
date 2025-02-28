import type { PoolConnection } from 'better-sqlite-pool';
import type { ContractFee } from '../types/recordTypes.js';
export default function getContractFees(contractId: number | string, connectedDatabase?: PoolConnection): Promise<ContractFee[]>;
