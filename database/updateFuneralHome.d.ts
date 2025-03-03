export interface UpdateForm {
    funeralHomeId: number | string;
    funeralHomeName: string;
    funeralHomeAddress1: string;
    funeralHomeAddress2: string;
    funeralHomeCity: string;
    funeralHomeProvince: string;
    funeralHomePostalCode: string;
    funeralHomePhoneNumber: string;
}
export default function updateFuneralHome(updateForm: UpdateForm, user: User): Promise<boolean>;
