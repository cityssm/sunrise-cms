import sqlite from 'better-sqlite3';
export default function getApiKeys(connectedDatabase?: sqlite.Database): Record<string, string>;
