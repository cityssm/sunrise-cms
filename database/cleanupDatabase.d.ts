interface CleanupResult {
    inactivatedRecordCount: number;
    purgedRecordCount: number;
}
export default function cleanupDatabase(user: User): Promise<CleanupResult>;
export {};
