import type sqlite from 'better-sqlite3'
import Debug from 'debug'

import addIntermentContainerType from '../../database/addIntermentContainerType.js'
import getIntermentContainerTypes from '../../database/getIntermentContainerTypes.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'

const debug = Debug(`${DEBUG_NAMESPACE}:legacyImportFromCsv:data.intermentContainerTypes`)

let intermentContainerTypes = getIntermentContainerTypes(true)

export function getIntermentContainerTypeIdByKey(
  intermentContainerTypeKey: string,
  user: User,
  database: sqlite.Database
): number {
  const intermentContainerType = intermentContainerTypes.find(
    (possibleIntermentContainerType) =>
      possibleIntermentContainerType.intermentContainerTypeKey ===
      intermentContainerTypeKey
  )

  if (intermentContainerType === undefined) {

    debug('Interment container type not found, adding new type:', intermentContainerTypeKey)

    const intermentContainerTypeId = addIntermentContainerType(
      {
        intermentContainerType: intermentContainerTypeKey,
        intermentContainerTypeKey
      },
      user,
      database
    )

    intermentContainerTypes = getIntermentContainerTypes(true, database)

    return intermentContainerTypeId
  }

  return intermentContainerType.intermentContainerTypeId
}
