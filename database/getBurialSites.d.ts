import type { PoolConnection } from 'better-sqlite-pool';
import type { BurialSite } from '../types/recordTypes.js';
interface GetBurialSitesFilters {
    burialSiteNameSearchType?: '' | 'startsWith' | 'endsWith';
    burialSiteName?: string;
    cemeteryId?: number | string;
    burialSiteTypeId?: number | string;
    burialSiteStatusId?: number | string;
    contractStatus?: '' | 'occupied' | 'unoccupied';
    workOrderId?: number | string;
}
interface GetBurialSitesOptions {
    /** -1 for no limit */
    limit: number;
    offset: number;
    includeBurialSiteContractCount?: boolean;
}
export default function getBurialSites(filters: GetBurialSitesFilters, options: GetBurialSitesOptions, connectedDatabase?: PoolConnection): Promise<{
    count: number;
    burialSites: BurialSite[];
}>;
export {};
