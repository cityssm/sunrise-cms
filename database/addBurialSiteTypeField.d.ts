export interface AddBurialSiteTypeFieldForm {
    burialSiteTypeId: number | string;
    burialSiteTypeField: string;
    fieldType?: string;
    fieldValues?: string;
    isRequired?: string;
    pattern?: string;
    minLength?: number | string;
    maxLength?: number | string;
    orderNumber?: number;
}
export default function addBurialSiteTypeField(addForm: AddBurialSiteTypeFieldForm, user: User): Promise<number>;
