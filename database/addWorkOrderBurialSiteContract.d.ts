import type { PoolConnection } from 'better-sqlite-pool';
export interface AddWorkOrderBurialSiteContractOccupancyForm {
    workOrderId: number | string;
    burialSiteContractId: number | string;
}
export default function addWorkOrderLotOccupancy(addForm: AddWorkOrderBurialSiteContractOccupancyForm, user: User, connectedDatabase?: PoolConnection): Promise<boolean>;
