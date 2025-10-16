import sqlite from 'better-sqlite3';
export interface DeleteRelatedContractForm {
    contractId: number | string;
    relatedContractId: number | string;
}
export default function deleteRelatedContract(relatedContractForm: DeleteRelatedContractForm, connectedDatabase?: sqlite.Database): boolean;
