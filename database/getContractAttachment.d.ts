import sqlite from 'better-sqlite3';
import type { ContractAttachment } from '../types/record.types.js';
export default function getContractAttachment(contractAttachmentId: number | string, connectedDatabase?: sqlite.Database): ContractAttachment | undefined;
