import type { PoolConnection } from 'better-sqlite-pool';
export default function rebuildBurialSiteNames(cemeteryId: number | string, user: User, connectedDatabase?: PoolConnection): Promise<number>;
