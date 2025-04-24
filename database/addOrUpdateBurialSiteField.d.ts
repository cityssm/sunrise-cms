import sqlite from 'better-sqlite3';
export interface BurialSiteFieldForm {
    burialSiteId: number | string;
    burialSiteTypeFieldId: number | string;
    fieldValue: string;
}
export default function addOrUpdateBurialSiteField(fieldForm: BurialSiteFieldForm, user: User, connectedDatabase?: sqlite.Database): boolean;
