export interface UpdateBurialSiteForm {
    burialSiteId: string | number;
    burialSiteNameSegment1?: string;
    burialSiteNameSegment2?: string;
    burialSiteNameSegment3?: string;
    burialSiteNameSegment4?: string;
    burialSiteNameSegment5?: string;
    burialSiteTypeId: string | number;
    burialSiteStatusId: string | number;
    cemeteryId: string | number;
    cemeterySvgId: string;
    burialSiteLatitude: string;
    burialSiteLongitude: string;
    burialSiteTypeFieldIds?: string;
    [fieldValue_burialSiteTypeFieldId: string]: unknown;
}
export default function updateBurialSite(updateForm: UpdateBurialSiteForm, user: User): Promise<boolean>;
export declare function updateBurialSiteStatus(burialSiteId: number | string, burialSiteStatusId: number | string, user: User): Promise<boolean>;
