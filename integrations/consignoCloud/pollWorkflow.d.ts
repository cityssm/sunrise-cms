import type { ConsignoCloudMetadataKey } from '../../types/contractMetadata.types.js';
export default function pollWorkflow(workflow: {
    contractId: number | string;
    metadata: Record<ConsignoCloudMetadataKey, string>;
}, user: User): Promise<boolean>;
export declare function clearApiCache(): void;
