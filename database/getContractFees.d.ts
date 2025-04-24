import sqlite from 'better-sqlite3';
import type { ContractFee } from '../types/record.types.js';
export default function getContractFees(contractId: number | string, connectedDatabase?: sqlite.Database): ContractFee[];
