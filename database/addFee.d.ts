export interface AddFeeForm {
    feeCategoryId: string | number;
    feeName: string;
    feeDescription: string;
    feeAccount: string;
    contractTypeId: string | number;
    burialSiteTypeId: string | number;
    feeAmount?: string;
    feeFunction?: string;
    taxAmount?: string;
    taxPercentage?: string;
    includeQuantity?: '' | '1';
    quantityUnit?: string;
    isRequired?: '' | '1';
    orderNumber?: number;
}
export default function addFee(feeForm: AddFeeForm, user: User): Promise<number>;
