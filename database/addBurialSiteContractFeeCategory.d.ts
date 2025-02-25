export interface AddBurialSiteContractCategoryForm {
    burialSiteContractId: number | string;
    feeCategoryId: number | string;
}
export default function addBurialSiteContractFeeCategory(addFeeCategoryForm: AddBurialSiteContractCategoryForm, user: User): Promise<number>;
