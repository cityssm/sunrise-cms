import type { PoolConnection } from 'better-sqlite-pool';
export default function getContractTypePrints(contractTypeId: number, connectedDatabase?: PoolConnection): Promise<string[]>;
