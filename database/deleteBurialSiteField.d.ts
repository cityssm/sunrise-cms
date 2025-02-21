import type { PoolConnection } from 'better-sqlite-pool';
export default function deleteBurialSiteField(burialSiteId: number | string, burialSiteTypeFieldId: number | string, user: User, connectedDatabase?: PoolConnection): Promise<boolean>;
