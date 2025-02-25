import type { PoolConnection } from 'better-sqlite-pool';
export interface AddBurialSiteContractForm {
    contractTypeId: string | number;
    burialSiteId: string | number;
    contractStartDateString: string;
    contractEndDateString: string;
    contractTypeFieldIds?: string;
    [fieldValue_contractTypeFieldId: string]: unknown;
    lotOccupantTypeId?: string;
    occupantName?: string;
    occupantFamilyName?: string;
    occupantAddress1?: string;
    occupantAddress2?: string;
    occupantCity?: string;
    occupantProvince?: string;
    occupantPostalCode?: string;
    occupantPhoneNumber?: string;
    occupantEmailAddress?: string;
    occupantComment?: string;
}
export default function addBurialSiteContract(addForm: AddBurialSiteContractForm, user: User, connectedDatabase?: PoolConnection): Promise<number>;
