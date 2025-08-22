import sqlite from 'better-sqlite3';
import type { FuneralHome } from '../types/record.types.js';
export default function getFuneralHome(funeralHomeId: number | string, includeDeleted?: boolean, connectedDatabase?: sqlite.Database): FuneralHome | undefined;
export declare function getFuneralHomeByKey(funeralHomeKey: string, includeDeleted?: boolean, connectedDatabase?: sqlite.Database): FuneralHome | undefined;
