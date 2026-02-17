import sqlite from 'better-sqlite3';
export interface UpdateForm {
    contractId: number | string;
    serviceTypeId: number | string;
    contractServiceDetails?: string;
}
export default function updateContractServiceType(updateForm: UpdateForm, user: User, connectedDatabase?: sqlite.Database): boolean;
