import sqlite from 'better-sqlite3';
import type { Cemetery } from '../types/record.types.js';
export default function getCemetery(cemeteryId: number | string, connectedDatabase?: sqlite.Database): Cemetery | undefined;
export declare function getCemeteryByKey(cemeteryKey: string, connectedDatabase?: sqlite.Database): Cemetery | undefined;
