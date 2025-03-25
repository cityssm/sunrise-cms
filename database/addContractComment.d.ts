import { type DateString, type TimeString } from '@cityssm/utils-datetime';
export interface AddContractCommentForm {
    comment: string;
    commentDateString?: DateString;
    commentTimeString?: TimeString;
    contractId: number | string;
}
export default function addContractComment(commentForm: AddContractCommentForm, user: User): Promise<number>;
