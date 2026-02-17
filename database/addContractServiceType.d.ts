import sqlite from 'better-sqlite3';
export interface AddForm {
    contractId: number | string;
    serviceTypeId: number | string;
    contractServiceDetails?: string;
}
export default function addContractServiceType(addForm: AddForm, user: User, connectedDatabase?: sqlite.Database): boolean;
