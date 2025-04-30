import { type DateString, type TimeString } from '@cityssm/utils-datetime';
export interface AddWorkOrderMilestoneForm {
    workOrderId: number | string;
    workOrderMilestoneTypeId: number | string;
    workOrderMilestoneDateString: '' | DateString;
    workOrderMilestoneTimeString?: '' | TimeString;
    workOrderMilestoneDescription: string;
    workOrderMilestoneCompletionDateString?: '' | DateString;
    workOrderMilestoneCompletionTimeString?: '' | TimeString;
}
export default function addWorkOrderMilestone(milestoneForm: AddWorkOrderMilestoneForm, user: User): number;
