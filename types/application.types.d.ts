export interface CacheBurialSiteIdsWorkerMessage extends WorkerMessage {
    messageType: 'cacheBurialSiteIds';
    burialSiteId: number;
    nextBurialSiteId: number;
}
export interface ClearCacheWorkerMessage extends WorkerMessage {
    messageType: 'clearCache';
    tableName: string;
}
export interface ClearNextPreviousBurialSiteIdsCacheWorkerMessage extends WorkerMessage {
    messageType: 'clearNextPreviousBurialSiteIdCache';
    burialSiteId: number;
}
export interface WorkerMessage {
    messageType: string;
    pid: number;
    timeMillis: number;
}
