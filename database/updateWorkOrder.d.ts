import { type DateString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
export interface UpdateWorkOrderForm {
    workOrderId: string;
    workOrderNumber: string;
    workOrderDescription: string;
    workOrderOpenDateString: DateString;
    workOrderTypeId: string;
}
export default function updateWorkOrder(workOrderForm: UpdateWorkOrderForm, user: User, connectedDatabase?: sqlite.Database): boolean;
