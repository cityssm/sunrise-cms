import { type DateString, type TimeString } from '@cityssm/utils-datetime';
export interface UpdateBurialSiteCommentForm {
    burialSiteCommentId: string | number;
    commentDateString: DateString;
    commentTimeString: TimeString;
    comment: string;
}
export default function updateBurialSiteComment(commentForm: UpdateBurialSiteCommentForm, user: User): Promise<boolean>;
