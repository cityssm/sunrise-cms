import type { Request, Response } from 'express'

import getUserSettings from '../../database/getUserSettings.js'
import {
  type UpdateConsignoCloudUserSettingsForm,
  updateConsignoCloudUserSettings
} from '../../database/updateConsignoCloudUserSettings.js'

export default function handler(
  request: Request<unknown, unknown, UpdateConsignoCloudUserSettingsForm>,
  response: Response
): void {
  const success = updateConsignoCloudUserSettings(
    request.body,
    request.session.user as User
  )

  if (success) {
    ;(request.session.user as User).userSettings = getUserSettings(
      request.session.user?.userName ?? ''
    )
  }

  response.json({
    success
  })
}
