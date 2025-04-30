import { type DateString } from '@cityssm/utils-datetime';
export interface CloseWorkOrderForm {
    workOrderId: number | string;
    workOrderCloseDateString?: '' | DateString;
}
export default function closeWorkOrder(workOrderForm: CloseWorkOrderForm, user: User): boolean;
