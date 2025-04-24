import sqlite from 'better-sqlite3';
import type { ContractComment } from '../types/record.types.js';
export default function getContractComments(contractId: number | string, connectedDatabase?: sqlite.Database): ContractComment[];
