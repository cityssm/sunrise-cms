import sqlite from 'better-sqlite3';
export default function cleanupDatabase(user: User, connectedDatabase?: sqlite.Database): {
    inactivatedRecordCount: number;
    purgedRecordCount: number;
};
