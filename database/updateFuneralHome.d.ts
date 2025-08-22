import sqlite from 'better-sqlite3';
export interface UpdateForm {
    funeralHomeId: number | string;
    funeralHomeName: string;
    funeralHomeAddress1: string;
    funeralHomeAddress2: string;
    funeralHomeCity: string;
    funeralHomePostalCode: string;
    funeralHomeProvince: string;
    funeralHomePhoneNumber: string;
}
export default function updateFuneralHome(updateForm: UpdateForm, user: User, connectedDatabase?: sqlite.Database): boolean;
