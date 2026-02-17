import sqlite from 'better-sqlite3';
import type { ServiceType } from '../types/record.types.js';
export default function getServiceTypes(includeDeleted?: boolean, connectedDatabase?: sqlite.Database | undefined): ServiceType[];
