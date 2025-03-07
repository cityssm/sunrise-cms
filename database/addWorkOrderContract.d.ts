import type { PoolConnection } from 'better-sqlite-pool';
export interface AddForm {
    workOrderId: number | string;
    contractId: number | string;
}
export default function addWorkOrderContract(addForm: AddForm, user: User, connectedDatabase?: PoolConnection): Promise<boolean>;
