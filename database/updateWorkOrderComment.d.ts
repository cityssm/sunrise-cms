import { type DateString, type TimeString } from '@cityssm/utils-datetime';
export interface UpdateWorkOrderCommentForm {
    workOrderCommentId: number | string;
    comment: string;
    commentDateString: DateString;
    commentTimeString: TimeString;
}
export default function updateWorkOrderComment(commentForm: UpdateWorkOrderCommentForm, user: User): boolean;
