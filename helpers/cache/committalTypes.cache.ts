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

export function getCachedCommittalTypes(): CommittalType[] {
  cache.committalTypes ??= getCommittalTypesFromDatabase()
  return cache.committalTypes
}

export function clearCommittalTypesCache(): void {
  cache.committalTypes = undefined
}
