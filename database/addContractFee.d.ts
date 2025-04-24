import sqlite from 'better-sqlite3';
export interface AddContractFeeForm {
    contractId: number | string;
    feeId: number | string;
    feeAmount?: number | string;
    quantity: number | string;
    taxAmount?: number | string;
}
export default function addContractFee(addFeeForm: AddContractFeeForm, user: User, connectedDatabase?: sqlite.Database): Promise<boolean>;
