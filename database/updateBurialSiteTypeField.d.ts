export interface UpdateBurialSiteTypeFieldForm {
    burialSiteTypeFieldId: number | string;
    burialSiteTypeField: string;
    isRequired: '0' | '1';
    fieldType?: string;
    maxLength?: string;
    minLength?: string;
    pattern?: string;
    fieldValues: string;
}
export default function updateBurialSiteTypeField(updateForm: UpdateBurialSiteTypeFieldForm, user: User): Promise<boolean>;
