import { type DateString, type TimeString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
export interface AddWorkOrderMilestoneForm {
    workOrderId: number | string;
    workOrderMilestoneTypeId: number | string;
    workOrderMilestoneDateString: '' | DateString;
    workOrderMilestoneTimeString?: '' | TimeString;
    workOrderMilestoneDescription: string;
    workOrderMilestoneCompletionDateString?: '' | DateString;
    workOrderMilestoneCompletionTimeString?: '' | TimeString;
}
export default function addWorkOrderMilestone(milestoneForm: AddWorkOrderMilestoneForm, user: User, connectedDatabase?: sqlite.Database): number;
