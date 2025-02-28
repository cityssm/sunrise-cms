import type { PoolConnection } from 'better-sqlite-pool';
import type { ContractComment } from '../types/recordTypes.js';
export default function getContractComments(contractId: number | string, connectedDatabase?: PoolConnection): Promise<ContractComment[]>;
