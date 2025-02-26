export interface UpdateContractTypeFieldForm {
    contractTypeFieldId: number | string;
    contractTypeField: string;
    isRequired: '0' | '1';
    fieldType?: string;
    minLength?: string;
    maxLength?: string;
    pattern?: string;
    fieldValues: string;
}
export default function updateContractTypeField(updateForm: UpdateContractTypeFieldForm, user: User): Promise<boolean>;
