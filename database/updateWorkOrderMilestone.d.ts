export interface UpdateWorkOrderMilestoneForm {
    workOrderMilestoneId: number | string;
    workOrderMilestoneDateString: string;
    workOrderMilestoneDescription: string;
    workOrderMilestoneTimeString?: string;
    workOrderMilestoneTypeId: number | string;
}
export default function updateWorkOrderMilestone(milestoneForm: UpdateWorkOrderMilestoneForm, user: User): boolean;
