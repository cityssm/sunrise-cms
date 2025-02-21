import type { PoolConnection } from 'better-sqlite-pool';
export interface BurialSiteContractFieldForm {
    burialSiteContractId: string | number;
    contractTypeFieldId: string | number;
    fieldValue: string;
}
export default function addOrUpdateBurialSiteContractField(fieldForm: BurialSiteContractFieldForm, user: User, connectedDatabase?: PoolConnection): Promise<boolean>;
