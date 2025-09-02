import type sqlite from 'better-sqlite3';
export interface BurialSiteFieldsForm {
    burialSiteTypeFieldIds?: string;
    [fieldValue_burialSiteTypeFieldId: `fieldValue_${number}`]: unknown;
}
export default function addOrUpdateBurialSiteFields(updateData: {
    burialSiteId: number | string;
    fieldForm: BurialSiteFieldsForm;
}, isNewBurialSite: boolean, user: User, database: sqlite.Database): void;
