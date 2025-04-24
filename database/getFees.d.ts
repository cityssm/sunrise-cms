import sqlite from 'better-sqlite3';
import type { Fee } from '../types/record.types.js';
interface GetFeesFilters {
    burialSiteTypeId?: number | string;
    contractTypeId?: number | string;
}
export default function getFees(feeCategoryId: number, additionalFilters: GetFeesFilters, connectedDatabase?: sqlite.Database): Fee[];
export {};
