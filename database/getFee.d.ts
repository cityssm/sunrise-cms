import sqlite from 'better-sqlite3';
import type { Fee } from '../types/record.types.js';
export default function getFee(feeId: number | string, connectedDatabase?: sqlite.Database): Fee | undefined;
