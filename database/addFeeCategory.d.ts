import sqlite from 'better-sqlite3';
export interface AddFeeCategoryForm {
    feeCategory: string;
    isGroupedFee?: '1';
    orderNumber?: number;
}
export default function addFeeCategory(feeCategoryForm: AddFeeCategoryForm, user: User, connectedDatabase?: sqlite.Database): number;
