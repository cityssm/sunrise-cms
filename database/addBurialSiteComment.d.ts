import sqlite from 'better-sqlite3';
export interface AddBurialSiteCommentForm {
    burialSiteId: string;
    comment: string;
}
export default function addBurialSiteComment(commentForm: AddBurialSiteCommentForm, user: User, connectedDatabase?: sqlite.Database): number;
