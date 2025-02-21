export declare function getNextBurialSiteId(burialSiteId: number): Promise<number | undefined>;
export declare function getPreviousBurialSiteId(burialSiteId: number): Promise<number | undefined>;
export declare function clearNextPreviousBurialSiteIdCache(burialSiteId?: number, relayMessage?: boolean): void;
