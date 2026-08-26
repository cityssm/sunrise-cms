import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

import updateUserSetting from './updateUserSetting.js'

export interface UpdateConsignoCloudUserSettingsForm {
  thirdPartyApplicationPassword: string
  username: string
}

export function updateConsignoCloudUserSettings(
  updateForm: UpdateConsignoCloudUserSettingsForm,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  updateUserSetting(
    user.username,
    'consignoCloud.username',
    updateForm.username,
    database
  )

  if (updateForm.thirdPartyApplicationPassword !== '') {
    updateUserSetting(
      user.username,
      'consignoCloud.thirdPartyApplicationPassword',
      updateForm.thirdPartyApplicationPassword,
      database
    )
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return true
}
