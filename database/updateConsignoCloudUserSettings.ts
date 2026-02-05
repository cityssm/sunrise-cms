import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

import updateUserSetting from './updateUserSetting.js'

export interface UpdateConsignoCloudUserSettingsForm {
  thirdPartyApplicationPassword: string
  userName: string
}

export function updateConsignoCloudUserSettings(
  updateForm: UpdateConsignoCloudUserSettingsForm,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  updateUserSetting(
    user.userName,
    'consignoCloud.userName',
    updateForm.userName,
    database
  )

  if (updateForm.thirdPartyApplicationPassword !== '') {
    updateUserSetting(
      user.userName,
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
