import Debug from 'debug'

import getCemetery from '../../database/getCemetery.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB, useTestDatabases } from '../../helpers/database.helpers.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:findAGraveMemorialExtractorImport:import`
)

export default function runFindAGraveMemorialExtractorImport(
  cemeteryId: string,
  pathToCsvFile: string
): void {
  /*
   * Ensure the script is being run against the testing database.
   */

  debug('Database: ', sunriseDB)

  if (!useTestDatabases) {
    throw new Error(
      'This script should only be run against the testing database.'
    )
  }

  /*
   * Ensure the specified cemetery exists in the database.
   */

  const cemetery = getCemetery(cemeteryId)

  if (cemetery === undefined) {
    throw new Error(`Cemetery with ID ${cemeteryId} not found.`)
  }
}
