import { type DateString, type TimeString } from '@cityssm/utils-datetime';
export interface UpdateWorkOrderMilestoneForm {
    workOrderMilestoneId: number | string;
    workOrderMilestoneDateString: '' | DateString;
    workOrderMilestoneDescription: string;
    workOrderMilestoneTimeString?: '' | TimeString;
    workOrderMilestoneTypeId: number | string;
}
export default function updateWorkOrderMilestone(milestoneForm: UpdateWorkOrderMilestoneForm, user: User): boolean;
