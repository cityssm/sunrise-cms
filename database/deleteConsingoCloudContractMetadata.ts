import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { MetadataKey } from '../types/contractMetadata.types.js'

import deleteContractMetadata from './deleteContractMetadata.js'

export default function deleteConsignoCloudContractMetadata(
  contractId: number | string,
  user: User
): boolean {
  const database = sqlite(sunriseDB)

  const consignoCloudMetadataKeys = [
    'consignoCloud.workflowId',
    'consignoCloud.workflowStatus',
    'consignoCloud.workflowEditUrl',
    'consignoCloud.workflowUser'
  ] as MetadataKey[]

  for (const metadataKey of consignoCloudMetadataKeys) {
    deleteContractMetadata(contractId, metadataKey, user, database)
  }

  database.close()

  return true

}
