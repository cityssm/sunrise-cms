import { type DateString, type TimeString } from '@cityssm/utils-datetime';
export interface AddContractCommentForm {
    contractId: number | string;
    comment: string;
    commentDateString?: DateString;
    commentTimeString?: TimeString;
}
export default function addContractComment(commentForm: AddContractCommentForm, user: User): Promise<number>;
