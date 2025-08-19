import { type DateString, type TimeString } from '@cityssm/utils-datetime';
export interface UpdateWorkOrderMilestoneTimeForm {
    workOrderMilestoneId: number | string;
    workOrderMilestoneDateString: '' | DateString;
    workOrderMilestoneTimeString?: '' | TimeString;
}
export declare function updateWorkOrderMilestoneTime(milestoneForm: UpdateWorkOrderMilestoneTimeForm, user: User): boolean;
