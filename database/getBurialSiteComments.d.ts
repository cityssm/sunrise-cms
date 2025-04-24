import sqlite from 'better-sqlite3';
import type { BurialSiteComment } from '../types/record.types.js';
export default function getBurialSiteComments(burialSiteId: number | string, connectedDatabase?: sqlite.Database): BurialSiteComment[];
