export interface AddForm {
    funeralHomeName: string;
    funeralHomeKey: string;
    funeralHomeAddress1: string;
    funeralHomeAddress2: string;
    funeralHomeCity: string;
    funeralHomePostalCode: string;
    funeralHomeProvince: string;
    funeralHomePhoneNumber: string;
}
export default function addFuneralHome(addForm: AddForm, user: User): number;
