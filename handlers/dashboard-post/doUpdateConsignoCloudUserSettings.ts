import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import getUserSettings from '../../database/getUserSettings.js'
import {
  type UpdateConsignoCloudUserSettingsForm,
  updateConsignoCloudUserSettings
} from '../../database/updateConsignoCloudUserSettings.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:handlers:dashboard:doUpdateConsignoCloudUserSettings`
)


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoUpdateConsignoCloudUserSettingsResponse =
  { success: boolean }
  | { errorMessage: string; success: false }

export default function handler(
  request: Request<unknown, unknown, UpdateConsignoCloudUserSettingsForm>,
  response: Response<DoUpdateConsignoCloudUserSettingsResponse>
): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const success = updateConsignoCloudUserSettings(
      request.body,
      request.session.user as User,
      database
    )

    if (success) {
      ;(request.session.user as User).userSettings = getUserSettings(
        request.session.user?.userName ?? '',
        database
      )
    }

    response.json({
      success
    })
  } catch (error) {
    debug(error)
    response
      .status(500)
      .json({ errorMessage: 'Database error', success: false })
  } finally {
    database?.close()
  }
}
