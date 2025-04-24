export interface AddTransactionForm {
    contractId: number | string;
    transactionDateString?: string;
    transactionTimeString?: string;
    externalReceiptNumber: string;
    transactionAmount: number | string;
    transactionNote: string;
}
export default function addContractTransaction(contractTransactionForm: AddTransactionForm, user: User): number;
