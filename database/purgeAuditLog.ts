/* eslint-disable @typescript-eslint/no-magic-numbers */

import type { DatabaseSync } from 'node:sqlite'

import { daysToMillis } from '@cityssm/to-millis'

import { getDatabaseConnection } from '../helpers/database.helpers.js'

export type PurgeAuditLogAge = 'all' | 'ninetyDays' | 'oneYear' | 'thirtyDays'

export default function purgeAuditLog(
  age: PurgeAuditLogAge,
  connectedDatabase?: DatabaseSync
): number {
  const database = connectedDatabase ?? getDatabaseConnection()

  const currentMillis = Date.now()

  let minimumMillis: number

  switch (age) {
    case 'ninetyDays': {
      minimumMillis = currentMillis - daysToMillis(90)
      break
    }
    case 'oneYear': {
      minimumMillis = currentMillis - daysToMillis(365)
      break
    }
    case 'thirtyDays': {
      minimumMillis = currentMillis - daysToMillis(30)
      break
    }
    default: {
      minimumMillis = currentMillis + 1
      break
    }
  }

  const result = database
    .prepare(/* sql */ `
      DELETE FROM AuditLog
      WHERE
        logMillis < ?
    `)
    .run(minimumMillis)

  database.exec('pragma optimize')

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes as number
}
