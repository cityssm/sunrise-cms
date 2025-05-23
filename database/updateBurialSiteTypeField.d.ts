export interface UpdateBurialSiteTypeFieldForm {
    burialSiteTypeFieldId: number | string;
    burialSiteTypeField: string;
    isRequired: '0' | '1';
    fieldType?: string;
    fieldValues: string;
    maxLength?: string;
    minLength?: string;
    pattern?: string;
}
export default function updateBurialSiteTypeField(updateForm: UpdateBurialSiteTypeFieldForm, user: User): boolean;
