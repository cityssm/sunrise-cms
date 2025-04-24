export interface CompleteWorkOrderMilestoneForm {
    workOrderMilestoneId: number | string;
    workOrderMilestoneCompletionDateString?: string;
    workOrderMilestoneCompletionTimeString?: string;
}
export default function completeWorkOrderMilestone(milestoneForm: CompleteWorkOrderMilestoneForm, user: User): boolean;
