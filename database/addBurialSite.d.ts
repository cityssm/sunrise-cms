export interface AddBurialSiteForm {
    burialSiteNameSegment1: string;
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
export default function addLot(burialSiteForm: AddBurialSiteForm, user: User): Promise<number>;
