export interface AddLotOccupancyTransactionForm {
    burialSiteContractId: string | number;
    transactionDateString?: string;
    transactionTimeString?: string;
    transactionAmount: string | number;
    externalReceiptNumber: string;
    transactionNote: string;
}
export default function addLotOccupancyTransaction(lotOccupancyTransactionForm: AddLotOccupancyTransactionForm, user: User): Promise<number>;
