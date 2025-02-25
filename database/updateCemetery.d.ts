export interface UpdateCemeteryForm {
    cemeteryId: string;
    cemeteryName: string;
    cemeteryKey: string;
    cemeteryDescription: string;
    cemeterySvg: string;
    cemeteryLatitude: string;
    cemeteryLongitude: string;
    cemeteryAddress1: string;
    cemeteryAddress2: string;
    cemeteryCity: string;
    cemeteryProvince: string;
    cemeteryPostalCode: string;
    cemeteryPhoneNumber: string;
}
export default function updateCemetery(updateForm: UpdateCemeteryForm, user: User): Promise<boolean>;
