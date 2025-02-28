export interface AddTransactionForm {
    contractId: string | number;
    transactionDateString?: string;
    transactionTimeString?: string;
    transactionAmount: string | number;
    externalReceiptNumber: string;
    transactionNote: string;
}
export default function addContractTransaction(contractTransactionForm: AddTransactionForm, user: User): Promise<number>;
