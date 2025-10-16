import sqlite from 'better-sqlite3';
export default function updateContractAttachment(contractAttachmentId: number | string, attachment: {
    attachmentDetails?: string;
    attachmentTitle?: string;
}, user: User, connectedDatabase?: sqlite.Database): boolean;
