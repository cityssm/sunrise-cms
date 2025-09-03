import sqlite from 'better-sqlite3';
import type { BurialSite } from '../types/record.types.js';
export interface GetBurialSitesFilters {
    burialSiteName?: string;
    burialSiteNameSearchType?: '' | 'endsWith' | 'startsWith';
    cemeteryId?: number | string;
    burialSiteStatusId?: number | string;
    burialSiteTypeId?: number | string;
    contractStatus?: '' | 'occupied' | 'unoccupied';
    workOrderId?: number | string;
    hasCoordinates?: '' | 'no' | 'yes';
}
export interface GetBurialSitesOptions {
    /** -1 for no limit */
    limit: number;
    offset: number | string;
    includeContractCount?: boolean;
    includeDeleted?: boolean;
}
export default function getBurialSites(filters: GetBurialSitesFilters, options: GetBurialSitesOptions, connectedDatabase?: sqlite.Database): {
    burialSites: BurialSite[];
    count: number;
};
