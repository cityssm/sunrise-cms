export interface AddWorkOrderLotForm {
    workOrderId: number | string;
    burialSiteId: number | string;
}
export default function addWorkOrderBurialSite(workOrderLotForm: AddWorkOrderLotForm, user: User): Promise<boolean>;
