import type { PoolConnection } from 'better-sqlite-pool';
import type { Fee } from '../types/recordTypes.js';
interface GetFeesFilters {
    burialSiteTypeId?: number | string;
    contractTypeId?: number | string;
}
export default function getFees(feeCategoryId: number, additionalFilters: GetFeesFilters, connectedDatabase?: PoolConnection): Promise<Fee[]>;
export {};
