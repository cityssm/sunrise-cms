import sqlite from 'better-sqlite3';
export interface AddContractTypeFieldForm {
    contractTypeId?: number | string;
    contractTypeField: string;
    fieldType?: string;
    fieldValues?: string;
    /** '' = not required */
    isRequired?: string;
    maxLength?: number | string;
    minLength?: number | string;
    pattern?: string;
    orderNumber?: number;
}
export default function addContractTypeField(addForm: AddContractTypeFieldForm, user: User, connectedDatabase?: sqlite.Database): number;
