export interface AddContractTypePrintForm {
    contractTypeId: string | number;
    printEJS: string;
    orderNumber?: number;
}
export default function addContractTypePrint(addForm: AddContractTypePrintForm, user: User): Promise<boolean>;
