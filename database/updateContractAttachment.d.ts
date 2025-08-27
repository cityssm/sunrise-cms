import sqlite from 'better-sqlite3';
export default function updateContractAttachment(contractAttachmentId: number | string, attachment: {
    attachmentTitle?: string;
    attachmentDetails?: string;
}, user: User, connectedDatabase?: sqlite.Database): boolean;
