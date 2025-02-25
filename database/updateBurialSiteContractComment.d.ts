import { type DateString, type TimeString } from '@cityssm/utils-datetime';
export interface UpdateForm {
    burialSiteContractCommentId: string | number;
    commentDateString: DateString;
    commentTimeString: TimeString;
    comment: string;
}
export default function updateBurialSiteContractComment(commentForm: UpdateForm, user: User): Promise<boolean>;
