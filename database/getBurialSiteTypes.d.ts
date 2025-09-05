import sqlite from 'better-sqlite3';
import type { BurialSiteType } from '../types/record.types.js';
export default function getBurialSiteTypes(includeDeleted?: boolean, connectedDatabase?: sqlite.Database | undefined): BurialSiteType[];
