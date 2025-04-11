import type { PoolConnection } from 'better-sqlite-pool';
import { type DateString } from '@cityssm/utils-datetime';
import type { Contract } from '../types/recordTypes.js';
export interface GetContractsFilters {
    burialSiteId?: number | string;
    contractTime?: '' | 'current' | 'future' | 'past';
    contractStartDateString?: DateString;
    contractEffectiveDateString?: string;
    deceasedName?: string;
    contractTypeId?: number | string;
    cemeteryId?: number | string;
    burialSiteName?: string;
    burialSiteNameSearchType?: '' | 'startsWith' | 'endsWith';
    burialSiteTypeId?: number | string;
    funeralHomeId?: number | string;
    notWorkOrderId?: number | string;
    workOrderId?: number | string;
}
export interface GetContractsOptions {
    /** -1 for no limit */
    limit: number | string;
    offset: number | string;
    includeInterments: boolean;
    includeFees: boolean;
    includeTransactions: boolean;
}
export default function getContracts(filters: GetContractsFilters, options: GetContractsOptions, connectedDatabase?: PoolConnection): Promise<{
    count: number;
    contracts: Contract[];
}>;
