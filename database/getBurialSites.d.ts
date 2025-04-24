import sqlite from 'better-sqlite3';
import type { BurialSite } from '../types/record.types.js';
export interface GetBurialSitesFilters {
    burialSiteNameSearchType?: '' | 'endsWith' | 'startsWith';
    burialSiteName?: string;
    cemeteryId?: number | string;
    burialSiteTypeId?: number | string;
    burialSiteStatusId?: number | string;
    contractStatus?: '' | 'occupied' | 'unoccupied';
    workOrderId?: number | string;
}
export interface GetBurialSitesOptions {
    /** -1 for no limit */
    limit: number;
    offset: number | string;
    includeContractCount?: boolean;
}
export default function getBurialSites(filters: GetBurialSitesFilters, options: GetBurialSitesOptions, connectedDatabase?: sqlite.Database): {
    count: number;
    burialSites: BurialSite[];
};
