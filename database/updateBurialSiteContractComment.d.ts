import { type DateString, type TimeString } from '@cityssm/utils-datetime';
export interface BurialSiteCommentUpdateForm {
    burialSiteContractCommentId: string | number;
    commentDateString: DateString;
    commentTimeString: TimeString;
    comment: string;
}
export default function updateBurialSiteContractComment(commentForm: BurialSiteCommentUpdateForm, user: User): Promise<boolean>;
