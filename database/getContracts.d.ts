import { type DateString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import type { Contract } from '../types/record.types.js';
export interface GetContractsFilters {
    burialSiteId?: number | string;
    contractEffectiveDateString?: string;
    contractStartDateString?: DateString;
    contractTime?: '' | 'current' | 'future' | 'past';
    cemeteryId?: number | string;
    contractTypeId?: number | string;
    deceasedName?: string;
    burialSiteName?: string;
    burialSiteNameSearchType?: '' | 'endsWith' | 'startsWith';
    burialSiteTypeId?: number | string;
    funeralHomeId?: number | string;
    funeralTime?: '' | 'upcoming';
    notWorkOrderId?: number | string;
    workOrderId?: number | string;
    notContractId?: number | string;
    notRelatedContractId?: number | string;
    relatedContractId?: number | string;
}
export interface GetContractsOptions {
    /** -1 for no limit */
    limit: number | string;
    offset: number | string;
    orderBy?: string;
    includeFees: boolean;
    includeInterments: boolean;
    includeTransactions: boolean;
}
export default function getContracts(filters: GetContractsFilters, options: GetContractsOptions, connectedDatabase?: sqlite.Database): Promise<{
    contracts: Contract[];
    count: number;
}>;
