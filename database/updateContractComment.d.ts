import { type DateString, type TimeString } from '@cityssm/utils-datetime';
export interface UpdateForm {
    comment: string;
    commentDateString: DateString;
    commentTimeString: TimeString;
    contractCommentId: number | string;
}
export default function updateContractComment(commentForm: UpdateForm, user: User): boolean;
