import getContractMetadata from './getContractMetadata.js';
export default function getConsignoCloudContractMetadata(contractId) {
    const rawMetadata = getContractMetadata({
        startsWith: 'consignoCloud.'
    });
    const metadata = {};
    for (const row of rawMetadata) {
        const key = row.metadataKey.split('.')[1];
        metadata[row.contractId] ??= {
            workflowId: '',
            workflowStatus: '',
            workflowEditUrl: '',
            workflowUser: ''
        };
        metadata[row.contractId][key] = row.metadataValue;
    }
    return metadata;
}
