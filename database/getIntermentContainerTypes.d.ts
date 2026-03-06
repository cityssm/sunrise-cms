import sqlite from 'better-sqlite3';
import type { IntermentContainerType } from '../types/record.types.js';
export default function getIntermentContainerTypes(includeDeleted?: boolean, connectedDatabase?: sqlite.Database): IntermentContainerType[];
