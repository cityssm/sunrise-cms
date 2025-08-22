import { type DateString, type TimeString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
export interface UpdateBurialSiteCommentForm {
    burialSiteCommentId: number | string;
    comment: string;
    commentDateString: DateString;
    commentTimeString: TimeString;
}
export default function updateBurialSiteComment(commentForm: UpdateBurialSiteCommentForm, user: User, connectedDatabase?: sqlite.Database): boolean;
