export interface UpdateBurialSiteFeeForm {
    contractId: string | number;
    feeId: string | number;
    quantity: string | number;
}
export default function updateContractFeeQuantity(feeQuantityForm: UpdateBurialSiteFeeForm, user: User): Promise<boolean>;
