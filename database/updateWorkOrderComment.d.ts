import { type DateString, type TimeString } from '@cityssm/utils-datetime';
export interface UpdateWorkOrderCommentForm {
    workOrderCommentId: string | number;
    commentDateString: DateString;
    commentTimeString: TimeString;
    comment: string;
}
export default function updateWorkOrderComment(commentForm: UpdateWorkOrderCommentForm, user: User): Promise<boolean>;
