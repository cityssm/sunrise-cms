import type { PoolConnection } from 'better-sqlite-pool';
import type { Contract } from '../types/recordTypes.js';
export default function getContract(contractId: number | string, connectedDatabase?: PoolConnection): Promise<Contract | undefined>;
