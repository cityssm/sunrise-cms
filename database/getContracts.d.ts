import { type DateString } from '@cityssm/utils-datetime';
import type { PoolConnection } from 'better-sqlite-pool';
import type { Contract } from '../types/recordTypes.js';
export interface GetContractsFilters {
    burialSiteId?: number | string;
    occupancyTime?: '' | 'past' | 'current' | 'future';
    contractStartDateString?: DateString;
    occupancyEffectiveDateString?: string;
    occupantName?: string;
    contractTypeId?: number | string;
    cemeteryId?: number | string;
    burialSiteNameSearchType?: '' | 'startsWith' | 'endsWith';
    burialSiteName?: string;
    burialSiteTypeId?: number | string;
    workOrderId?: number | string;
    notWorkOrderId?: number | string;
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
