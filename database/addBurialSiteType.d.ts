export interface AddBurialSiteTypeForm {
    burialSiteType: string;
    bodyCapacityMax: number | string;
    crematedCapacityMax: number | string;
    orderNumber?: number | string;
}
export default function addBurialSiteType(addForm: AddBurialSiteTypeForm, user: User): number;
