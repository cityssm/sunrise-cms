import sqlite from 'better-sqlite3';
export interface UpdateBurialSiteForm {
    burialSiteId: number | string;
    burialSiteNameSegment1?: string;
    burialSiteNameSegment2?: string;
    burialSiteNameSegment3?: string;
    burialSiteNameSegment4?: string;
    burialSiteNameSegment5?: string;
    burialSiteStatusId: number | string;
    burialSiteTypeId: number | string;
    bodyCapacity?: number | string;
    crematedCapacity?: number | string;
    burialSiteImage: string;
    cemeteryId: number | string;
    cemeterySvgId: string;
    burialSiteLatitude: string;
    burialSiteLongitude: string;
    [fieldValue_burialSiteTypeFieldId: string]: unknown;
    burialSiteTypeFieldIds?: string;
}
/**
 * Updates a burial site.
 * @param updateForm - The burial site's updated information
 * @param user - The user making the request
 * @returns True if the burial site was updated.
 * @throws If an active burial site with the same name already exists.
 */
export default function updateBurialSite(updateForm: UpdateBurialSiteForm, user: User): boolean;
export declare function updateBurialSiteStatus(burialSiteId: number | string, burialSiteStatusId: number | string, user: User, connectedDatabase?: sqlite.Database): boolean;
export declare function updateBurialSiteLatitudeLongitude(burialSiteId: number | string, burialSiteLatitude: string, burialSiteLongitude: string, user: User): boolean;
