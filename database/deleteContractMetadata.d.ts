import sqlite from 'better-sqlite3';
import type { MetadataKey } from '../types/contractMetadata.types.js';
export default function deleteContractMetadata(contractId: number | string, metadataKey: MetadataKey, user: User, connectedDatabase?: sqlite.Database): boolean;
