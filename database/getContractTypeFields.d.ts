import sqlite from 'better-sqlite3';
import type { ContractTypeField } from '../types/record.types.js';
export default function getContractTypeFields(contractTypeId?: number, connectedDatabase?: sqlite.Database): ContractTypeField[];
