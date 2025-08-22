import sqlite from 'better-sqlite3';
export interface AddContractCategoryForm {
    contractId: number | string;
    feeCategoryId: number | string;
}
export default function addContractFeeCategory(addFeeCategoryForm: AddContractCategoryForm, user: User, connectedDatabase?: sqlite.Database): Promise<number>;
