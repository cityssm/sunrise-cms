import sqlite from 'better-sqlite3';
import type { IntermentDepth } from '../types/record.types.js';
export default function getIntermentDepths(includeDeleted?: boolean, connectedDatabase?: sqlite.Database): IntermentDepth[];
