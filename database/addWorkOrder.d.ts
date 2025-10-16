import { type DateString, type TimeString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
export interface AddWorkOrderForm {
    workOrderDescription: string;
    workOrderNumber?: string;
    workOrderTypeId: number | string;
    workOrderCloseDateString?: string;
    workOrderOpenDateString?: string;
    contractId?: string;
    [workOrderMilestoneId: `workOrderMilestoneId_${number}`]: string | undefined;
    [workOrderMilestoneDateString: `workOrderMilestoneDateString_${number}`]: DateString | undefined;
    [workOrderMilestoneTimeString: `workOrderMilestoneTimeString_${number}`]: '' | TimeString | undefined;
    [workOrderMilestoneDescription: `workOrderMilestoneDescription_${number}`]: string | undefined;
}
export default function addWorkOrder(workOrderForm: AddWorkOrderForm, user: User, connectedDatabase?: sqlite.Database): number;
