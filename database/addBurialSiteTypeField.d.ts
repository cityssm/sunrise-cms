export interface AddBurialSiteTypeFieldForm {
    burialSiteTypeId: string | number;
    burialSiteTypeField: string;
    fieldType?: string;
    fieldValues?: string;
    isRequired?: string;
    pattern?: string;
    minLength?: string | number;
    maxLength?: string | number;
    orderNumber?: number;
}
export default function addBurialSiteTypeField(addForm: AddBurialSiteTypeFieldForm, user: User): Promise<number>;
