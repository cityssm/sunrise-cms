export interface AddTransactionForm {
    burialSiteContractId: string | number;
    transactionDateString?: string;
    transactionTimeString?: string;
    transactionAmount: string | number;
    externalReceiptNumber: string;
    transactionNote: string;
}
export default function addBurialSiteContractTransaction(burialSiteContractTransactionForm: AddTransactionForm, user: User): Promise<number>;
