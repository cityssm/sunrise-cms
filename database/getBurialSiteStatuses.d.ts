import sqlite from 'better-sqlite3';
import type { BurialSiteStatus } from '../types/record.types.js';
export default function getBurialSiteStatuses(includeDeleted?: boolean, connectedDatabase?: sqlite.Database): BurialSiteStatus[];
