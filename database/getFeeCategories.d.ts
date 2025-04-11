import type { PoolConnection } from 'better-sqlite-pool';
import type { FeeCategory } from '../types/recordTypes.js';
interface GetFeeCategoriesFilters {
    burialSiteTypeId?: number | string;
    contractTypeId?: number | string;
    feeCategoryId?: number | string;
}
interface GetFeeCategoriesOptions {
    includeFees?: boolean;
}
export default function getFeeCategories(filters: GetFeeCategoriesFilters, options: GetFeeCategoriesOptions, connectedDatabase?: PoolConnection): Promise<FeeCategory[]>;
export declare function getFeeCategory(feeCategoryId: number | string, connectedDatabase?: PoolConnection): Promise<FeeCategory | undefined>;
export {};
