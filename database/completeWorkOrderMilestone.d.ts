import sqlite from 'better-sqlite3';
import { type DateString, type TimeString } from '@cityssm/utils-datetime';
export interface CompleteWorkOrderMilestoneForm {
    workOrderMilestoneId: number | string;
    workOrderMilestoneCompletionDateString?: '' | DateString;
    workOrderMilestoneCompletionTimeString?: '' | TimeString;
}
export default function completeWorkOrderMilestone(milestoneForm: CompleteWorkOrderMilestoneForm, user: User, connectedDatabase?: sqlite.Database): boolean;
