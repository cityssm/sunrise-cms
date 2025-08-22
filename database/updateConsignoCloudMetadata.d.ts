import sqlite from 'better-sqlite3';
export default function updateConsignoCloudMetadata(contractId: number | string, metadata: {
    workflowId: string;
    workflowStatus: number | string;
    workflowEditUrl: string;
}, user: User, connectedDatabase?: sqlite.Database): boolean;
