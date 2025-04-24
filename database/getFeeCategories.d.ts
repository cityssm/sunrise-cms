import sqlite from 'better-sqlite3';
import type { FeeCategory } from '../types/record.types.js';
interface GetFeeCategoriesFilters {
    burialSiteTypeId?: number | string;
    contractTypeId?: number | string;
    feeCategoryId?: number | string;
}
interface GetFeeCategoriesOptions {
    includeFees?: boolean;
}
export default function getFeeCategories(filters: GetFeeCategoriesFilters, options: GetFeeCategoriesOptions, connectedDatabase?: sqlite.Database): FeeCategory[];
export declare function getFeeCategory(feeCategoryId: number | string, connectedDatabase?: sqlite.Database): FeeCategory | undefined;
export {};
