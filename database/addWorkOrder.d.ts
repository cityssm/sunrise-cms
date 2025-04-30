export interface AddWorkOrderForm {
    workOrderDescription: string;
    workOrderNumber?: string;
    workOrderTypeId: number | string;
    workOrderCloseDateString?: string;
    workOrderOpenDateString?: string;
    contractId?: string;
}
export default function addWorkOrder(workOrderForm: AddWorkOrderForm, user: User): number;
