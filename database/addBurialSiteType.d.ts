import sqlite from 'better-sqlite3';
export interface AddBurialSiteTypeForm {
    burialSiteType: string;
    bodyCapacityMax: number | string;
    crematedCapacityMax: number | string;
    orderNumber?: number | string;
}
export default function addBurialSiteType(addForm: AddBurialSiteTypeForm, user: User, connectedDatabase?: sqlite.Database): number;
