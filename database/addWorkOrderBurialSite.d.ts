import sqlite from 'better-sqlite3';
export interface AddForm {
    burialSiteId: number | string;
    workOrderId: number | string;
}
export default function addWorkOrderBurialSite(workOrderBurialSiteForm: AddForm, user: User, connectedDatabase?: sqlite.Database): boolean;
