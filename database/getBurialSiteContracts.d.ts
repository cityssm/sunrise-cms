import { type DateString } from '@cityssm/utils-datetime';
import type { PoolConnection } from 'better-sqlite-pool';
import type { BurialSiteContract } from '../types/recordTypes.js';
interface GetBurialSiteContractsFilters {
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
interface GetBurialSiteContractsOptions {
    /** -1 for no limit */
    limit: number;
    offset: number;
    includeInterments: boolean;
    includeFees: boolean;
    includeTransactions: boolean;
}
export default function getBurialSiteContracts(filters: GetBurialSiteContractsFilters, options: GetBurialSiteContractsOptions, connectedDatabase?: PoolConnection): Promise<{
    count: number;
    burialSiteContracts: BurialSiteContract[];
}>;
export {};
