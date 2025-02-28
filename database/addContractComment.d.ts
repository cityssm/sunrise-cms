import { type DateString, type TimeString } from '@cityssm/utils-datetime';
export interface AddContractCommentForm {
    contractId: string | number;
    commentDateString?: DateString;
    commentTimeString?: TimeString;
    comment: string;
}
export default function addContractComment(commentForm: AddContractCommentForm, user: User): Promise<number>;
