import sqlite from 'better-sqlite3';
export interface AddFeeForm {
    feeCategoryId: number | string;
    feeName: string;
    feeDescription: string;
    feeAccount: string;
    contractTypeId: number | string;
    burialSiteTypeId: number | string;
    feeAmount?: string;
    feeFunction?: string;
    taxAmount?: string;
    taxPercentage?: string;
    includeQuantity?: '' | '1';
    quantityUnit?: string;
    isRequired?: '' | '1';
    orderNumber?: number;
}
export default function addFee(feeForm: AddFeeForm, user: User, connectedDatabase?: sqlite.Database): number;
