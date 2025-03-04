export interface UpdateForm {
    contractTypeId: number | string;
    contractType: string;
    isPreneed?: string;
}
export default function updateContractType(updateForm: UpdateForm, user: User): Promise<boolean>;
