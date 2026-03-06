import sqlite from 'better-sqlite3';
import type { ContractType } from '../types/record.types.js';
export default function getContractTypes(includeDeleted?: boolean, connectedDatabase?: sqlite.Database): ContractType[];
