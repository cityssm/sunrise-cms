import { type DateString, type TimeString } from '@cityssm/utils-datetime';
export interface BurialSiteContractTransactionUpdateForm {
    burialSiteContractId: string | number;
    transactionIndex: string | number;
    transactionDateString: DateString;
    transactionTimeString: TimeString;
    transactionAmount: string | number;
    externalReceiptNumber: string;
    transactionNote: string;
}
export default function updateBurialSiteContractTransaction(updateForm: BurialSiteContractTransactionUpdateForm, user: User): Promise<boolean>;
