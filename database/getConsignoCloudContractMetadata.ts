import type { ConsignoCloudMetadataKey } from '../types/contractMetadata.types.js'

import getContractMetadata from './getContractMetadata.js'

export default function getConsignoCloudContractMetadata(
  contractId?: number | string
): Record<number, Record<ConsignoCloudMetadataKey, string>> {
  const rawMetadata = getContractMetadata({
    contractId,
    startsWith: 'consignoCloud.'
  })

  const metadata: Record<number, Record<ConsignoCloudMetadataKey, string>> = {}

  for (const row of rawMetadata) {
    const key = row.metadataKey.split('.')[1] as ConsignoCloudMetadataKey

    metadata[row.contractId] ??= {
      workflowId: '',
      workflowStatus: '',
      workflowEditUrl: '',
      workflowUser: ''
    }

    metadata[row.contractId][key] = row.metadataValue
  }

  return metadata
}
