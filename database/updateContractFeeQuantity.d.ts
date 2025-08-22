import sqlite from 'better-sqlite3';
export interface UpdateBurialSiteFeeForm {
    contractId: number | string;
    feeId: number | string;
    quantity: number | string;
}
export default function updateContractFeeQuantity(feeQuantityForm: UpdateBurialSiteFeeForm, user: User, connectedDatabase?: sqlite.Database): boolean;
