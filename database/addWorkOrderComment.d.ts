import sqlite from 'better-sqlite3';
export interface AddWorkOrderCommentForm {
    comment: string;
    workOrderId: string;
}
export default function addWorkOrderComment(workOrderCommentForm: AddWorkOrderCommentForm, user: User, connectedDatabase?: sqlite.Database): number;
