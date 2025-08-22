import sqlite from 'better-sqlite3';
export interface UpdateIntermentContainerTypeForm {
    intermentContainerTypeId: number | string;
    intermentContainerType: string;
    isCremationType: '0' | '1';
}
export default function updateIntermentContainerType(updateForm: UpdateIntermentContainerTypeForm, user: User, connectedDatabase?: sqlite.Database): boolean;
