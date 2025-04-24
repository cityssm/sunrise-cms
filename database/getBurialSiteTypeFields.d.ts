import sqlite from 'better-sqlite3';
import type { BurialSiteTypeField } from '../types/record.types.js';
export default function getBurialSiteTypeFields(burialSiteTypeId: number, connectedDatabase?: sqlite.Database): BurialSiteTypeField[];
