import type { PoolConnection } from 'better-sqlite-pool';
export interface AddBurialSiteContractFeeForm {
    burialSiteContractId: number | string;
    feeId: number | string;
    quantity: number | string;
    feeAmount?: number | string;
    taxAmount?: number | string;
}
export default function addBurialSiteContractFee(addFeeForm: AddBurialSiteContractFeeForm, user: User, connectedDatabase?: PoolConnection): Promise<boolean>;
