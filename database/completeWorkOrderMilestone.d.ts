import { type DateString, type TimeString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
export interface CompleteWorkOrderMilestoneForm {
    workOrderMilestoneId: number | string;
    workOrderMilestoneCompletionDateString?: '' | DateString;
    workOrderMilestoneCompletionTimeString?: '' | TimeString;
}
export default function completeWorkOrderMilestone(milestoneForm: CompleteWorkOrderMilestoneForm, user: User, connectedDatabase?: sqlite.Database): boolean;
