export interface AddWorkOrderLotForm {
    workOrderId: number | string;
    burialSiteId: number | string;
}
export default function addWorkOrderLot(workOrderLotForm: AddWorkOrderLotForm, user: User): Promise<boolean>;
