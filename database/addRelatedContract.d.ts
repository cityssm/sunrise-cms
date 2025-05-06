import sqlite from 'better-sqlite3';
export interface AddRelatedContractForm {
    contractId: number | string;
    relatedContractId: number | string;
}
export default function addRelatedContract(relatedContractForm: AddRelatedContractForm, connectedDatabase?: sqlite.Database): boolean;
