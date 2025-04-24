export interface AddFeeCategoryForm {
    feeCategory: string;
    isGroupedFee?: '1';
    orderNumber?: number;
}
export default function addFeeCategory(feeCategoryForm: AddFeeCategoryForm, user: User): number;
