import type { PoolConnection } from 'better-sqlite-pool';
import { type DateString } from '@cityssm/utils-datetime';
import type { Contract } from '../types/record.types.js';
export interface GetContractsFilters {
    burialSiteId?: number | string;
    contractEffectiveDateString?: string;
    contractStartDateString?: DateString;
    contractTime?: '' | 'current' | 'future' | 'past';
    deceasedName?: string;
    contractTypeId?: number | string;
    cemeteryId?: number | string;
    burialSiteName?: string;
    burialSiteNameSearchType?: '' | 'endsWith' | 'startsWith';
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
