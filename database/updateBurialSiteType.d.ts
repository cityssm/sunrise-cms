export interface UpdateBurialSiteTypeForm {
    burialSiteTypeId: number | string;
    burialSiteType: string;
    bodyCapacityMax: number | string;
    crematedCapacityMax: number | string;
}
export default function updateBurialSiteType(updateForm: UpdateBurialSiteTypeForm, user: User): boolean;
