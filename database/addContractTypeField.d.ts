export interface AddContractTypeFieldForm {
    contractTypeId?: string | number;
    contractTypeField: string;
    fieldValues?: string;
    fieldType?: string;
    isRequired?: string;
    pattern?: string;
    minLength?: string | number;
    maxLength?: string | number;
    orderNumber?: number;
}
export default function addContractTypeField(addForm: AddContractTypeFieldForm, user: User): Promise<number>;
