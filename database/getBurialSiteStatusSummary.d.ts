import sqlite from 'better-sqlite3';
import type { BurialSiteStatus } from '../types/record.types.js';
interface BurialSiteStatusSummary extends BurialSiteStatus {
    burialSiteCount: number;
}
interface GetFilters {
    cemeteryId?: number | string;
}
export default function getBurialSiteStatusSummary(filters: GetFilters, connectedDatabase?: sqlite.Database): BurialSiteStatusSummary[];
export {};
