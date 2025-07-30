import type { MetadataKey, MetadataPrefix } from '../types/contractMetadata.types.js';
export default function getContractMetadataByContractId(contractId: number | string, startsWith?: '' | MetadataPrefix): Partial<Record<MetadataKey, string>>;
