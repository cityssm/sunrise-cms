import sqlite from 'better-sqlite3';
import type { ContractTransaction } from '../types/record.types.js';
export default function GetContractTransactions(contractId: number | string, options: {
    includeIntegrations: boolean;
}, connectedDatabase?: sqlite.Database): Promise<ContractTransaction[]>;
