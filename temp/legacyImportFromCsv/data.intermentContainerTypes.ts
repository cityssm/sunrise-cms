import addIntermentContainerType from '../../database/addIntermentContainerType.js'
import getIntermentContainerTypes from '../../database/getIntermentContainerTypes.js'

let intermentContainerTypes = getIntermentContainerTypes(true)

export function getIntermentContainerTypeIdByKey(
  intermentContainerTypeKey: string,
  user: User
): number {
  const intermentContainerType = intermentContainerTypes.find(
    (possibleIntermentContainerType) =>
      possibleIntermentContainerType.intermentContainerTypeKey ===
      intermentContainerTypeKey
  )

  if (intermentContainerType === undefined) {
    const intermentContainerTypeId = addIntermentContainerType(
      {
        intermentContainerType: intermentContainerTypeKey,
        intermentContainerTypeKey
      },
      user
    )

    intermentContainerTypes = getIntermentContainerTypes(true)

    return intermentContainerTypeId
  }

  return intermentContainerType.intermentContainerTypeId
}
