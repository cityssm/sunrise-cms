import sqlite from 'better-sqlite3';
import type { CommittalType } from '../types/record.types.js';
export default function getCommittalTypes(includeDeleted?: boolean, connectedDatabase?: sqlite.Database | undefined): CommittalType[];
