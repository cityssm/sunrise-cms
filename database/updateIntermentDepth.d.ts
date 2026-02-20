import sqlite from 'better-sqlite3';
export interface UpdateIntermentDepthForm {
    intermentDepthId: number | string;
    intermentDepth: string;
}
export default function updateIntermentDepth(updateForm: UpdateIntermentDepthForm, user: User, connectedDatabase?: sqlite.Database): boolean;
