import { type DateString, type TimeString } from '@cityssm/utils-datetime';
export interface AddBurialSiteContractCommentForm {
    burialSiteContractId: string | number;
    commentDateString?: DateString;
    commentTimeString?: TimeString;
    comment: string;
}
export default function addBurialSiteContractComment(commentForm: AddBurialSiteContractCommentForm, user: User): Promise<number>;
