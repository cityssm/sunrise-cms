import type { PoolConnection } from 'better-sqlite-pool';
export interface AddContractFeeForm {
    contractId: number | string;
    feeId: number | string;
    quantity: number | string;
    feeAmount?: number | string;
    taxAmount?: number | string;
}
export default function addContractFee(addFeeForm: AddContractFeeForm, user: User, connectedDatabase?: PoolConnection): Promise<boolean>;
