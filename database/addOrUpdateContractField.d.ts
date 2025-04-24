import sqlite from 'better-sqlite3';
export interface ContractFieldForm {
    contractId: number | string;
    contractTypeFieldId: number | string;
    fieldValue: string;
}
export default function addOrUpdateContractField(fieldForm: ContractFieldForm, user: User, connectedDatabase?: sqlite.Database): boolean;
