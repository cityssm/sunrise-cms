import type sqlite from 'better-sqlite3'
import Debug from 'debug'

import addIntermentDepth from '../../database/addIntermentDepth.js'
import getIntermentDepths from '../../database/getIntermentDepths.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:legacyImportFromCsv:data.intermentDepths`
)

let intermentDepths = getIntermentDepths(true)

export function getIntermentDepthIdByKey(
  intermentDepthKey: string,
  user: User,
  database: sqlite.Database
): number {
  const intermentDepth = intermentDepths.find(
    (possibleIntermentDepth) =>
      possibleIntermentDepth.intermentDepthKey === intermentDepthKey
  )

  if (intermentDepth === undefined) {
    debug('Interment depth not found, adding new depth:', intermentDepthKey)

    const intermentDepthId = addIntermentDepth(
      {
        intermentDepth: intermentDepthKey,
        intermentDepthKey
      },
      user,
      database
    )

    intermentDepths = getIntermentDepths(true, database)

    return intermentDepthId
  }

  return intermentDepth.intermentDepthId
}
