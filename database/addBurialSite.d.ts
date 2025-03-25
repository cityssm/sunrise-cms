export interface AddBurialSiteForm {
    burialSiteNameSegment1: string;
    burialSiteNameSegment2?: string;
    burialSiteNameSegment3?: string;
    burialSiteNameSegment4?: string;
    burialSiteNameSegment5?: string;
    burialSiteStatusId: number | string;
    burialSiteTypeId: number | string;
    cemeteryId: number | string;
    cemeterySvgId: string;
    burialSiteLatitude: string;
    burialSiteLongitude: string;
    burialSiteTypeFieldIds?: string;
    [fieldValue_burialSiteTypeFieldId: string]: unknown;
}
/**
 * Creates a new burial site.
 * @param burialSiteForm - The new burial site's information
 * @param user - The user making the request
 * @returns The new burial site's id.
 * @throws If an active burial site with the same name already exists.
 */
export default function addBurialSite(burialSiteForm: AddBurialSiteForm, user: User): Promise<number>;
