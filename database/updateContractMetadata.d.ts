import sqlite from 'better-sqlite3';
import type { MetadataKey } from '../types/contractMetadata.types.js';
export default function updateContractMetadata(contractId: number | string, metadata: {
    metadataKey: MetadataKey;
    metadataValue: string;
}, user: User, connectedDatabase?: sqlite.Database): boolean;
