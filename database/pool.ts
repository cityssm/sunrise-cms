import { type PoolConnection, Pool } from 'better-sqlite-pool'
import Debug from 'debug'
import exitHook from 'exit-hook'

import { DEBUG_NAMESPACE } from '../debug.config.js'
import { sunriseDB as databasePath } from '../helpers/database.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:sunriseDB:pool`)

const pool = new Pool(databasePath)

export async function acquireConnection(): Promise<PoolConnection> {
  return await pool.acquire()
}

exitHook(() => {
  debug('Closing database pool')
  pool.close()
})
