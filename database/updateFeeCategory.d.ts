export interface UpdateFeeCategoryForm {
    feeCategoryId: number | string;
    feeCategory: string;
    isGroupedFee?: '1';
}
export default function updateFeeCategory(feeCategoryForm: UpdateFeeCategoryForm, user: User): boolean;
