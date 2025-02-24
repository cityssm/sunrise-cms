export interface AddBurialSiteContractCategoryForm {
    burialSiteContractId: number | string;
    feeCategoryId: number | string;
}
export default function addLotOccupancyFeeCategory(addFeeCategoryForm: AddBurialSiteContractCategoryForm, user: User): Promise<number>;
