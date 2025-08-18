import { type DateString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
export interface CloseWorkOrderForm {
    workOrderId: number | string;
    workOrderCloseDateString?: '' | DateString;
}
export default function closeWorkOrder(workOrderForm: CloseWorkOrderForm, user: User, connectedDatabase?: sqlite.Database): boolean;
