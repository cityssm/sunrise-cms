import { type DateString } from '@cityssm/utils-datetime';
export interface UpdateWorkOrderForm {
    workOrderId: string;
    workOrderNumber: string;
    workOrderDescription: string;
    workOrderOpenDateString: DateString;
    workOrderTypeId: string;
}
export default function updateWorkOrder(workOrderForm: UpdateWorkOrderForm, user: User): boolean;
