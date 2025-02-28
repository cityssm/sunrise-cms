import type { PoolConnection } from 'better-sqlite-pool';
export interface ContractFieldForm {
    contractId: string | number;
    contractTypeFieldId: string | number;
    fieldValue: string;
}
export default function addOrUpdateContractField(fieldForm: ContractFieldForm, user: User, connectedDatabase?: PoolConnection): Promise<boolean>;
