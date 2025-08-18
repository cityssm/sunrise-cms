import sqlite from 'better-sqlite3';
export interface AddWorkOrderForm {
    workOrderDescription: string;
    workOrderNumber?: string;
    workOrderTypeId: number | string;
    workOrderCloseDateString?: string;
    workOrderOpenDateString?: string;
    contractId?: string;
}
export default function addWorkOrder(workOrderForm: AddWorkOrderForm, user: User, connectedDatabase?: sqlite.Database): number;
