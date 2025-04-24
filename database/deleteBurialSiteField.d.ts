import sqlite from 'better-sqlite3';
export default function deleteBurialSiteField(burialSiteId: number | string, burialSiteTypeFieldId: number | string, user: User, connectedDatabase?: sqlite.Database): boolean;
