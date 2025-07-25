import sqlite from 'better-sqlite3';
export interface AddForm {
    funeralHomeKey?: string;
    funeralHomeName: string;
    funeralHomeAddress1: string;
    funeralHomeAddress2: string;
    funeralHomeCity: string;
    funeralHomePostalCode: string;
    funeralHomeProvince: string;
    funeralHomePhoneNumber: string;
}
export default function addFuneralHome(addForm: AddForm, user: User, connectedDatabase?: sqlite.Database): number;
