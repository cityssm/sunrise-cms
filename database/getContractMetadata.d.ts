import type { MetadataPrefix } from '../types/contractMetadata.types.js';
import type { ContractMetadata } from '../types/record.types.js';
export default function getContractMetadata(filters: {
    contractId?: number | string;
    startsWith?: '' | MetadataPrefix;
}): ContractMetadata[];
