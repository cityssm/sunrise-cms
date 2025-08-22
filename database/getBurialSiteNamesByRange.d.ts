import sqlite from 'better-sqlite3';
export interface GetBurialSiteNamesByRangeForm {
    burialSiteNameSegment1_from?: string;
    burialSiteNameSegment1_to?: string;
    burialSiteNameSegment2_from?: string;
    burialSiteNameSegment2_to?: string;
    burialSiteNameSegment3_from?: string;
    burialSiteNameSegment3_to?: string;
    burialSiteNameSegment4_from?: string;
    burialSiteNameSegment4_to?: string;
    burialSiteNameSegment5_from?: string;
    burialSiteNameSegment5_to?: string;
    cemeteryId: number | string;
}
export type GetBurialSiteNamesByRangeResult = Array<{
    burialSiteId?: number;
    burialSiteName: string;
    burialSiteNameSegment1: string;
    burialSiteNameSegment2: string;
    burialSiteNameSegment3: string;
    burialSiteNameSegment4: string;
    burialSiteNameSegment5: string;
}>;
export declare const burialSiteNameRangeLimit = 1000;
export default function getBurialSiteNamesByRange(rangeForm: GetBurialSiteNamesByRangeForm, connectedDatabase?: sqlite.Database): GetBurialSiteNamesByRangeResult;
