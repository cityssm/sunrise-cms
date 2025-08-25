import sqlite from 'better-sqlite3';
import type { DatabaseUser } from '../types/record.types.js';
export default function getUser(userName: string, connectedDatabase?: sqlite.Database): DatabaseUser | undefined;
