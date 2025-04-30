export interface AddWorkOrderCommentForm {
    comment: string;
    workOrderId: string;
}
export default function addWorkOrderComment(workOrderCommentForm: AddWorkOrderCommentForm, user: User): number;
