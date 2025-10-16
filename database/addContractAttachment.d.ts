import sqlite from 'better-sqlite3';
export default function addContractAttachment(attachment: {
    contractId: number | string;
    attachmentDetails?: string;
    attachmentTitle?: string;
    fileName: string;
    filePath: string;
}, user: User, connectedDatabase?: sqlite.Database): number;
