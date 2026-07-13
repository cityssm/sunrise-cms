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

export type DoUpdateConsignoCloudUserSettingsResponse =
  | { errorMessage: string; success: false }
  | { success: true }

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

    if (!success) {
      response
        .status(400)
        .json({ errorMessage: 'Failed to update settings', success: false })
      return
    }

    ;(request.session.user as User).userSettings = getUserSettings(
      request.session.user?.userName ?? '',
      database
    )

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
