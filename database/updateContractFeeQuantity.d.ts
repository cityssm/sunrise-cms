export interface UpdateBurialSiteFeeForm {
    contractId: number | string;
    feeId: number | string;
    quantity: number | string;
}
export default function updateContractFeeQuantity(feeQuantityForm: UpdateBurialSiteFeeForm, user: User): Promise<boolean>;
