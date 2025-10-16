export type ConsignoCloudMetadataKey = 'workflowEditUrl' | 'workflowId' | 'workflowStatus' | 'workflowUser';
export type ConsignoCloudMetadataPrefix = 'consignoCloud.';
export type MetadataPrefix = ConsignoCloudMetadataPrefix;
export type MetadataKey = `${ConsignoCloudMetadataPrefix}${ConsignoCloudMetadataKey}`;
