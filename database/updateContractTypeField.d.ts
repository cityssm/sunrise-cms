import sqlite from 'better-sqlite3';
export interface UpdateContractTypeFieldForm {
    contractTypeFieldId: number | string;
    contractTypeField: string;
    fieldType?: string;
    fieldValues: string;
    isRequired: '0' | '1';
    maxLength?: string;
    minLength?: string;
    pattern?: string;
}
export default function updateContractTypeField(updateForm: UpdateContractTypeFieldForm, user: User, connectedDatabase?: sqlite.Database): boolean;
