import sqlite from 'better-sqlite3';
import { type DateString, type TimeString } from '@cityssm/utils-datetime';
export interface UpdateBurialSiteCommentForm {
    burialSiteCommentId: number | string;
    comment: string;
    commentDateString: DateString;
    commentTimeString: TimeString;
}
export default function updateBurialSiteComment(commentForm: UpdateBurialSiteCommentForm, user: User, connectedDatabase?: sqlite.Database): boolean;
