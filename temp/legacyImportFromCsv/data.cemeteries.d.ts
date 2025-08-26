import type sqlite from 'better-sqlite3';
export declare const cremationCemeteryKeys: Set<string>;
export declare function getCemeteryIdByKey(cemeteryKeyToSearch: string | undefined, user: User, database: sqlite.Database): number;
