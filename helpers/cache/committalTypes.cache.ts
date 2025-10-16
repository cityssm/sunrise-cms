import getCommittalTypesFromDatabase from '../../database/getCommittalTypes.js'
import type { CommittalType } from '../../types/record.types.js'

let committalTypes: CommittalType[] | undefined

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
  committalTypes ??= getCommittalTypesFromDatabase()
  return committalTypes
}

export function clearCommittalTypesCache(): void {
  committalTypes = undefined
}
