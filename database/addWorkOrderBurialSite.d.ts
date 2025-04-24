export interface AddForm {
    workOrderId: number | string;
    burialSiteId: number | string;
}
export default function addWorkOrderBurialSite(workOrderLotForm: AddForm, user: User): boolean;
