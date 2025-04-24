import sqlite from 'better-sqlite3';
import type { Contract } from '../types/record.types.js';
export default function getContract(contractId: number | string, connectedDatabase?: sqlite.Database): Promise<Contract | undefined>;
