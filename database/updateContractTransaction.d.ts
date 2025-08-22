import { type DateString, type TimeString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
export interface ContractTransactionUpdateForm {
    contractId: number | string;
    transactionIndex: number | string;
    transactionDateString: DateString;
    transactionTimeString: TimeString;
    isInvoiced?: '0' | '1' | 0 | 1;
    externalReceiptNumber: string;
    transactionAmount: number | string;
    transactionNote: string;
}
export default function updateContractTransaction(updateForm: ContractTransactionUpdateForm, user: User, connectedDatabase?: sqlite.Database): boolean;
