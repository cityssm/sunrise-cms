import { type DateString, type TimeString } from '@cityssm/utils-datetime';
export interface ContractTransactionUpdateForm {
    contractId: number | string;
    transactionIndex: number | string;
    transactionDateString: DateString;
    transactionTimeString: TimeString;
    externalReceiptNumber: string;
    transactionAmount: number | string;
    transactionNote: string;
}
export default function updateContractTransaction(updateForm: ContractTransactionUpdateForm, user: User): boolean;
