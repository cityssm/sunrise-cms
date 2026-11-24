import type { DatabaseSync } from 'node:sqlite'

import getCommittalTypesFromDatabase from '../../database/getCommittalTypes.js'
import type { CommittalType } from '../../types/record.types.js'

const cache: {
  committalTypes: CommittalType[] | undefined
} = {
  committalTypes: undefined
}

export function getCachedCommittalTypeById(
  committalTypeId: number
): CommittalType | undefined {
  const cachedCommittalTypes = getCachedCommittalTypes()

  return cachedCommittalTypes.find(
    (currentCommittalType) =>
      currentCommittalType.committalTypeId === committalTypeId
  )
}

export function getCachedCommittalTypes(
  shouldIncludeDeletedRecords = false,
  connectedDatabase?: DatabaseSync
): CommittalType[] {
  if (shouldIncludeDeletedRecords) {
    return getCommittalTypesFromDatabase(
      shouldIncludeDeletedRecords,
      connectedDatabase
    )
  }

  cache.committalTypes ??= getCommittalTypesFromDatabase(
    shouldIncludeDeletedRecords,
    connectedDatabase
  )

  return cache.committalTypes
}

export function clearCommittalTypesCache(): void {
  cache.committalTypes = undefined
}
