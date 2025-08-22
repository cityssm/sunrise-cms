import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

import updateContractMetadata from './updateContractMetadata.js'

export default function updateConsignoCloudMetadata(
  contractId: number | string,
  metadata: {
    workflowId: string
    workflowStatus: number | string
    workflowEditUrl: string
  },
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  updateContractMetadata(
    contractId,
    {
      metadataKey: 'consignoCloud.workflowId',
      metadataValue: metadata.workflowId
    },
    user,
    database
  )

  updateContractMetadata(
    contractId,
    {
      metadataKey: 'consignoCloud.workflowStatus',
      metadataValue: metadata.workflowStatus.toString()
    },
    user,
    database
  )

  updateContractMetadata(
    contractId,
    {
      metadataKey: 'consignoCloud.workflowEditUrl',
      metadataValue: metadata.workflowEditUrl
    },
    user,
    database
  )

  updateContractMetadata(
    contractId,
    {
      metadataKey: 'consignoCloud.workflowUser',
      metadataValue: user.userName
    },
    user,
    database
  )

  if (connectedDatabase === undefined) {
    database.close()
  }
  
  return true
}
