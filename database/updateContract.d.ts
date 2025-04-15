import { type DateString, type TimeString } from '@cityssm/utils-datetime';
export interface UpdateContractForm {
    contractId: number | string;
    burialSiteId: number | string;
    contractTypeId: number | string;
    contractEndDateString: '' | DateString;
    contractStartDateString: DateString;
    funeralHomeId?: number | string;
    committalTypeId?: number | string;
    funeralDateString: '' | DateString;
    funeralDirectorName: string;
    funeralTimeString: '' | TimeString;
    purchaserName?: string;
    purchaserAddress1?: string;
    purchaserAddress2?: string;
    purchaserCity?: string;
    purchaserPostalCode?: string;
    purchaserProvince?: string;
    purchaserEmail?: string;
    purchaserPhoneNumber?: string;
    purchaserRelationship?: string;
    contractTypeFieldIds?: string;
    [fieldValue_contractTypeFieldId: `fieldValue_${string}`]: unknown;
}
export default function updateContract(updateForm: UpdateContractForm, user: User): Promise<boolean>;
