export interface UpdateCemeteryForm {
    cemeteryId: string;
    cemeteryDescription: string;
    cemeteryKey: string;
    cemeteryName: string;
    cemeteryAddress1: string;
    cemeteryAddress2: string;
    cemeteryCity: string;
    cemeteryPostalCode: string;
    cemeteryProvince: string;
    cemeteryPhoneNumber: string;
    cemeteryLatitude: string;
    cemeteryLongitude: string;
    cemeterySvg: string;
}
export default function updateCemetery(updateForm: UpdateCemeteryForm, user: User): Promise<{
    doRebuildBurialSiteNames: boolean;
    success: boolean;
}>;
