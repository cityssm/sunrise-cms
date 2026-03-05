import sqlite from 'better-sqlite3';
import type { BurialSite } from '../types/record.types.js';
export default function getBurialSite(burialSiteId: number | string, includeDeleted?: boolean, connectedDatabase?: sqlite.Database): Promise<BurialSite | undefined>;
export declare function getBurialSiteByBurialSiteName(burialSiteName: string, includeDeleted?: boolean, connectedDatabase?: sqlite.Database): Promise<BurialSite | undefined>;
