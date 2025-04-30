export interface AddForm {
    burialSiteId: number | string;
    workOrderId: number | string;
}
export default function addWorkOrderBurialSite(workOrderLotForm: AddForm, user: User): boolean;
