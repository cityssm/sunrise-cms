import sqlite from 'better-sqlite3';
import type { BurialSiteType } from '../types/record.types.js';
interface BurialSiteTypeSummary extends BurialSiteType {
    lotCount: number;
}
interface GetFilters {
    cemeteryId?: number | string;
}
export default function getBurialSiteTypeSummary(filters: GetFilters, connectedDatabase?: sqlite.Database): BurialSiteTypeSummary[];
export {};
