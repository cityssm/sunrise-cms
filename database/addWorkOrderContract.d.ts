import type { PoolConnection } from 'better-sqlite-pool';
export interface AddWorkOrderContractOccupancyForm {
    workOrderId: number | string;
    contractId: number | string;
}
export default function addWorkOrderContract(addForm: AddWorkOrderContractOccupancyForm, user: User, connectedDatabase?: PoolConnection): Promise<boolean>;
