import sqlite from 'better-sqlite3';
export default function deleteWorkOrderBurialSite(workOrderId: number | string, burialSiteId: number | string, user: User, connectedDatabase?: sqlite.Database): boolean;
