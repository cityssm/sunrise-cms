export declare function clearNextPreviousBurialSiteIdCache(burialSiteId?: number, relayMessage?: boolean): void;
export declare function getNextBurialSiteId(burialSiteId: number): number | undefined;
export declare function getPreviousBurialSiteId(burialSiteId: number): number | undefined;
export declare function buildBurialSiteName(cemeteryKey: string | undefined, segments: {
    burialSiteNameSegment1?: string;
    burialSiteNameSegment2?: string;
    burialSiteNameSegment3?: string;
    burialSiteNameSegment4?: string;
    burialSiteNameSegment5?: string;
}): string;
