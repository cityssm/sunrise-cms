import sqlite from 'better-sqlite3';
export interface AddIntermentDepthForm {
    intermentDepth: string;
    intermentDepthKey?: string;
    orderNumber?: number | string;
}
export default function addIntermentDepth(addForm: AddIntermentDepthForm, user: User, connectedDatabase?: sqlite.Database): number;
