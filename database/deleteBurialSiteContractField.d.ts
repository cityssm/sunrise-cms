import type { PoolConnection } from 'better-sqlite-pool';
export default function deleteBurialSiteContractField(burialSiteContractId: number | string, contractTypeFieldId: number | string, user: User, connectedDatabase?: PoolConnection): Promise<boolean>;
