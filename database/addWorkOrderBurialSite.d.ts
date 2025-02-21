export interface AddWorkOrderLotForm {
    workOrderId: number | string;
    lotId: number | string;
}
export default function addWorkOrderLot(workOrderLotForm: AddWorkOrderLotForm, user: User): Promise<boolean>;
