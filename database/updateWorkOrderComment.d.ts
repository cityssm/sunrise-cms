import { type DateString, type TimeString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
export interface UpdateWorkOrderCommentForm {
    workOrderCommentId: number | string;
    comment: string;
    commentDateString: DateString;
    commentTimeString: TimeString;
}
export default function updateWorkOrderComment(commentForm: UpdateWorkOrderCommentForm, user: User, connectedDatabase?: sqlite.Database): boolean;
