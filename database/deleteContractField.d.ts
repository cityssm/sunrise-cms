import type { PoolConnection } from 'better-sqlite-pool';
export default function deleteContractField(contractId: number | string, contractTypeFieldId: number | string, user: User, connectedDatabase?: PoolConnection): Promise<boolean>;
