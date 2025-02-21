import type { PoolConnection } from 'better-sqlite-pool';
export interface BurialSiteFieldForm {
    burialSiteId: string | number;
    burialSiteTypeFieldId: string | number;
    fieldValue: string;
}
export default function addOrUpdateBurialSiteField(fieldForm: BurialSiteFieldForm, user: User, connectedDatabase?: PoolConnection): Promise<boolean>;
