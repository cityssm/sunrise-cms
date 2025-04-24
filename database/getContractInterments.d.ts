import sqlite from 'better-sqlite3';
import type { ContractInterment } from '../types/record.types.js';
export default function getContractInterments(contractId: number | string, connectedDatabase?: sqlite.Database): ContractInterment[];
