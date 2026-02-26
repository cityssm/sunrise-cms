import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import getUserSettings from '../../database/getUserSettings.js'
import { updateApiKeyUserSetting } from '../../database/updateUserSetting.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { sunriseDB } from '../../helpers/database.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:handlers:dashboard:doResetApiKey`)


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoResetApiKeyResponse =
  { success: true; apiKey: string }
  | { errorMessage: string; success: false }

export default function handler(request: Request, response: Response<DoResetApiKeyResponse>): void {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB)

    const apiKey = updateApiKeyUserSetting(
      request.session.user?.userName ?? '',
      database
    )

    ;(request.session.user as User).userSettings = getUserSettings(
      request.session.user?.userName ?? '',
      database
    )

    response.json({
      success: true,

      apiKey
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
