export type ConsignoCloudMetadataKey =
  | 'workflowEditUrl'
  | 'workflowId'
  | 'workflowStatus'
  | 'workflowUser'

export type ConsignoCloudMetadataPrefix = 'consignoCloud.'

// eslint-disable-next-line sonarjs/redundant-type-aliases
export type MetadataPrefix = ConsignoCloudMetadataPrefix

export type MetadataKey =
  `${ConsignoCloudMetadataPrefix}${ConsignoCloudMetadataKey}`
