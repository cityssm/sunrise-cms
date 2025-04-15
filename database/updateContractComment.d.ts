import { type DateString, type TimeString } from '@cityssm/utils-datetime';
export interface UpdateForm {
    contractCommentId: number | string;
    commentDateString: DateString;
    commentTimeString: TimeString;
    comment: string;
}
export default function updateContractComment(commentForm: UpdateForm, user: User): Promise<boolean>;
