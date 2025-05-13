import type sqlite from 'better-sqlite3';
/**
 * Purge a burial site from the database.
 * Burial sites cannot be purged if they are associated with active contracts or work orders.
 * @param burialSiteId - The ID of the burial site to purge.
 * @param database - The SQLite database connection.
 * @returns True if the burial site was purged, false otherwise.
 */
export declare function purgeBurialSite(burialSiteId: number, database: sqlite.Database): boolean;
