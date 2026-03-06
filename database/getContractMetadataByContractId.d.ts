import sqlite from 'better-sqlite3';
import type { MetadataKey, MetadataPrefix } from '../types/contractMetadata.types.js';
export default function getContractMetadataByContractId(contractId: number | string, startsWith?: '' | MetadataPrefix, connectedDatabase?: sqlite.Database): Partial<Record<MetadataKey, string>>;
