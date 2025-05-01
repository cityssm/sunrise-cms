import addCommittalType from '../../database/addCommittalType.js'
import getCommittalTypes from '../../database/getCommittalTypes.js'

let committalTypes = getCommittalTypes(true)

export function getCommittalTypeIdByKey(
  committalTypeKey: string,
  user: User
): number {
  const committalType = committalTypes.find(
    (committalType) => committalType.committalTypeKey === committalTypeKey
  )

  if (committalType === undefined) {
    const committalTypeId = addCommittalType(
      {
        committalType: committalTypeKey,
        committalTypeKey
      },
      user
    )

    committalTypes = getCommittalTypes(true)

    return committalTypeId
  }

  return committalType.committalTypeId
}
