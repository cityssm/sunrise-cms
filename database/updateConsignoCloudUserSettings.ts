import type { DatabaseSync } from 'node:sqlite'

import { getDatabaseConnection } from '../helpers/database.helpers.js'

import updateUserSetting from './updateUserSetting.js'

export interface UpdateConsignoCloudUserSettingsForm {
  thirdPartyApplicationPassword: string
  username: string
}

export function updateConsignoCloudUserSettings(
  updateForm: UpdateConsignoCloudUserSettingsForm,
  user: User,
  connectedDatabase?: DatabaseSync
): boolean {
  const database = connectedDatabase ?? getDatabaseConnection()

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
