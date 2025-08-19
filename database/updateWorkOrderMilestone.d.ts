import { type DateString, type TimeString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
export interface UpdateWorkOrderMilestoneForm {
    workOrderMilestoneId: number | string;
    workOrderMilestoneDateString: '' | DateString;
    workOrderMilestoneDescription: string;
    workOrderMilestoneTimeString?: '' | TimeString;
    workOrderMilestoneTypeId: number | string;
}
export default function updateWorkOrderMilestone(milestoneForm: UpdateWorkOrderMilestoneForm, user: User, connectedDatabase?: sqlite.Database): boolean;
