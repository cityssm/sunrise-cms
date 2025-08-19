import sqlite from 'better-sqlite3';
import type { FuneralHome } from '../types/record.types.js';
export default function getFuneralHomes(connectedDatabase?: sqlite.Database): FuneralHome[];
