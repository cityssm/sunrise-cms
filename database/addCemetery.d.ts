export interface AddCemeteryForm {
    cemeteryName: string;
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
export default function addCemetery(addForm: AddCemeteryForm, user: User): Promise<number>;
