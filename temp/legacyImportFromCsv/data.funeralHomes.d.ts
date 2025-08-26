import type sqlite from 'better-sqlite3';
export declare function getFuneralHomeIdByKey(funeralHomeKey: string, user: User, database: sqlite.Database): number;
export declare function initializeFuneralHomes(user: User): void;
