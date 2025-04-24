import sqlite from 'better-sqlite3';
import type { BurialSiteField } from '../types/record.types.js';
export default function getBurialSiteFields(burialSiteId: number | string, connectedDatabase?: sqlite.Database): BurialSiteField[];
