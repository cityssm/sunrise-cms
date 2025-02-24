import { type DateString } from '@cityssm/utils-datetime';
export interface UpdateBurialSiteContractForm {
    burialSiteContractId: string | number;
    contractTypeId: string | number;
    burialSiteId: string | number;
    contractStartDateString: DateString;
    contractEndDateString: DateString | '';
    contractTypeFieldIds?: string;
    [fieldValue_contractTypeFieldId: string]: unknown;
}
export default function updateBurialSiteContract(updateForm: UpdateBurialSiteContractForm, user: User): Promise<boolean>;
