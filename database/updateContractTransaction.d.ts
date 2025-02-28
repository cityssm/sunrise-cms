import { type DateString, type TimeString } from '@cityssm/utils-datetime';
export interface ContractTransactionUpdateForm {
    contractId: string | number;
    transactionIndex: string | number;
    transactionDateString: DateString;
    transactionTimeString: TimeString;
    transactionAmount: string | number;
    externalReceiptNumber: string;
    transactionNote: string;
}
export default function updateContractTransaction(updateForm: ContractTransactionUpdateForm, user: User): Promise<boolean>;
