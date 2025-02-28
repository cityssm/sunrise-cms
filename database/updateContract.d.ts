import { type DateString } from '@cityssm/utils-datetime';
export interface UpdateContractForm {
    contractId: string | number;
    contractTypeId: string | number;
    burialSiteId: string | number;
    contractStartDateString: DateString;
    contractEndDateString: DateString | '';
    contractTypeFieldIds?: string;
    [fieldValue_contractTypeFieldId: string]: unknown;
}
export default function updateContract(updateForm: UpdateContractForm, user: User): Promise<boolean>;
