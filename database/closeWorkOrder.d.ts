export interface CloseWorkOrderForm {
    workOrderId: number | string;
    workOrderCloseDateString?: string;
}
export default function closeWorkOrder(workOrderForm: CloseWorkOrderForm, user: User): boolean;
