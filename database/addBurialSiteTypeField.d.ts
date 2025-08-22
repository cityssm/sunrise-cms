import sqlite from 'better-sqlite3';
export interface AddBurialSiteTypeFieldForm {
    burialSiteTypeId: number | string;
    burialSiteTypeField: string;
    fieldType?: string;
    fieldValues?: string;
    isRequired?: string;
    maxLength?: number | string;
    minLength?: number | string;
    pattern?: string;
    orderNumber?: number;
}
export default function addBurialSiteTypeField(addForm: AddBurialSiteTypeFieldForm, user: User, connectedDatabase?: sqlite.Database): number;
