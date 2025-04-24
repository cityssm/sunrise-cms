export interface AddWorkOrderCommentForm {
    workOrderId: string;
    comment: string;
}
export default function addWorkOrderComment(workOrderCommentForm: AddWorkOrderCommentForm, user: User): number;
