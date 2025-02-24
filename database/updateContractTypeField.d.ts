export interface UpdateContractTypeFieldForm {
    contractTypeFieldId: number | string;
    contractTypeField: string;
    isRequired: '0' | '1';
    fieldType?: string;
    minimumLength?: string;
    maximumLength?: string;
    pattern?: string;
    fieldValues: string;
}
export default function updateContractTypeField(updateForm: UpdateContractTypeFieldForm, user: User): Promise<boolean>;
