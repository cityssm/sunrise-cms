import sqlite from 'better-sqlite3';
export interface UpdateFeeCategoryForm {
    feeCategoryId: number | string;
    feeCategory: string;
    isGroupedFee?: '1';
}
export default function updateFeeCategory(feeCategoryForm: UpdateFeeCategoryForm, user: User, connectedDatabase?: sqlite.Database): boolean;
