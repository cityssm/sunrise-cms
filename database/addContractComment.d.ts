import { type DateString, type TimeString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
export interface AddContractCommentForm {
    contractId: number | string;
    comment: string;
    commentDateString?: DateString;
    commentTimeString?: TimeString;
}
export default function addContractComment(commentForm: AddContractCommentForm, user: User, connectedDatabase?: sqlite.Database): number;
