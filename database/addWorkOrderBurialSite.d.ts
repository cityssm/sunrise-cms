import sqlite from 'better-sqlite3';
export interface AddForm {
    burialSiteId: number | string;
    workOrderId: number | string;
}
export default function addWorkOrderBurialSite(workOrderLotForm: AddForm, user: User, connectedDatabase?: sqlite.Database): boolean;
