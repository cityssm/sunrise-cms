export interface AddContractCategoryForm {
    contractId: number | string;
    feeCategoryId: number | string;
}
export default function addContractFeeCategory(addFeeCategoryForm: AddContractCategoryForm, user: User): Promise<number>;
