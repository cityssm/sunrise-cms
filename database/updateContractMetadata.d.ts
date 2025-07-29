import sqlite from 'better-sqlite3';
export default function updateContractMetadata(contractId: number | string, metadata: {
    metadataKey: string;
    metadataValue: string;
}, user: User, connectedDatabase?: sqlite.Database): boolean;
