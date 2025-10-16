import { type DateString, type TimeString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
export interface UpdateWorkOrderMilestoneTimeForm {
    workOrderMilestoneId: number | string;
    workOrderMilestoneDateString: '' | DateString;
    workOrderMilestoneTimeString?: '' | TimeString;
}
export declare function updateWorkOrderMilestoneTime(milestoneForm: UpdateWorkOrderMilestoneTimeForm, user: User, connectedDatabase?: sqlite.Database): boolean;
