export declare const useTestDatabases: boolean;
export declare const sunriseDBLive = "data/sunrise.db";
export declare const sunriseDBTesting = "data/sunrise-testing.db";
export declare const sunriseDB: string;
export declare const backupFolder = "data/backups";
export declare function sanitizeLimit(limit: number | string): number;
export declare function sanitizeOffset(offset: number | string): number;
export declare function getLastBackupDate(): Promise<Date | undefined>;
