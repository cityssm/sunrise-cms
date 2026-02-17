import sqlite from 'better-sqlite3';
import type { ServiceType } from '../types/record.types.js';
export default function getContractServiceTypes(contractId: number | string, connectedDatabase?: sqlite.Database | undefined): ServiceType[];
