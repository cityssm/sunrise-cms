export interface AddContractTypePrintForm {
    contractTypeId: number | string;
    printEJS: string;
    orderNumber?: number;
}
export default function addContractTypePrint(addForm: AddContractTypePrintForm, user: User): boolean;
