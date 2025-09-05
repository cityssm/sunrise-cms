import sqlite from 'better-sqlite3';
export default function updateConsignoCloudMetadata(contractId: number | string, metadata: {
    workflowId: string;
    workflowEditUrl: string;
    workflowStatus: number | string;
}, user: User, connectedDatabase?: sqlite.Database): boolean;
