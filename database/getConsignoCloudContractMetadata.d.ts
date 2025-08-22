import sqlite from 'better-sqlite3';
import type { ConsignoCloudMetadataKey } from '../types/contractMetadata.types.js';
export default function getConsignoCloudContractMetadata(contractId?: number | string, connectedDatabase?: sqlite.Database): Record<number, Record<ConsignoCloudMetadataKey, string>>;
