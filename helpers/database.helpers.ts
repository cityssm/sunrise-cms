import Debug from 'debug'

import { DEBUG_NAMESPACE } from '../debug.config.js'

import { getConfigProperty } from './config.helpers.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:database.helpers:${process.pid.toString().padEnd(5)}`
)

export const useTestDatabases =
  getConfigProperty('application.useTestDatabases') ||
  process.env.TEST_DATABASES === 'true'

if (useTestDatabases) {
  debug('Using "-testing" databases.')
}

export const sunriseDBLive = 'data/sunrise.db'
export const sunriseDBTesting = 'data/sunrise-testing.db'

export const sunriseDB = useTestDatabases ? sunriseDBTesting : sunriseDBLive

export function sanitizeLimit(limit: number | string): number {
  const limitNumber = Number(limit)

  if (Number.isNaN(limitNumber) || limitNumber < 0) {
    return 50
  }

  return Math.floor(limitNumber)
}

export function sanitizeOffset(offset: number | string): number {
  const offsetNumber = Number(offset)

  if (Number.isNaN(offsetNumber) || offsetNumber < 0) {
    return 0
  }

  return Math.floor(offsetNumber)
}
