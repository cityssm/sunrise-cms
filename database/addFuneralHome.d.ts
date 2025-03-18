export interface AddForm {
    funeralHomeName: string;
    funeralHomeKey: string;
    funeralHomeAddress1: string;
    funeralHomeAddress2: string;
    funeralHomeCity: string;
    funeralHomeProvince: string;
    funeralHomePostalCode: string;
    funeralHomePhoneNumber: string;
}
export default function addFuneralHome(addForm: AddForm, user: User): Promise<number>;
