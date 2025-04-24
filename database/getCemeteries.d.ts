import sqlite from 'better-sqlite3';
import type { Cemetery } from '../types/record.types.js';
export default function getCemeteries(filters?: {
    parentCemeteryId?: number | string;
}, connectedDatabase?: sqlite.Database): Cemetery[];
