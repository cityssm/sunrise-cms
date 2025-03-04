import { type DateString } from '@cityssm/utils-datetime';
export interface UpdateContractForm {
    contractId: string | number;
    contractTypeId: string | number;
    burialSiteId: string | number;
    contractStartDateString: DateString;
    contractEndDateString: DateString | '';
    funeralHomeId?: string | number;
    funeralDirectorName?: string;
    purchaserName?: string;
    purchaserAddress1?: string;
    purchaserAddress2?: string;
    purchaserCity?: string;
    purchaserProvince?: string;
    purchaserPostalCode?: string;
    purchaserPhoneNumber?: string;
    purchaserEmail?: string;
    purchaserRelationship?: string;
    contractTypeFieldIds?: string;
    [fieldValue_contractTypeFieldId: `fieldValue_${string}`]: unknown;
}
export default function updateContract(updateForm: UpdateContractForm, user: User): Promise<boolean>;
