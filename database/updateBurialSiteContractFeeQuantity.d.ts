export interface UpdateBurialSiteFeeForm {
    burialSiteContractId: string | number;
    feeId: string | number;
    quantity: string | number;
}
export default function updateBurialSiteContractFeeQuantity(feeQuantityForm: UpdateBurialSiteFeeForm, user: User): Promise<boolean>;
