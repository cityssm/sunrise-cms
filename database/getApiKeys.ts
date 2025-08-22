import sqlite from 'better-sqlite3'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

const loginUsers = getConfigProperty('users.canLogin')

export default function getApiKeys(connectedDatabase?: sqlite.Database): Record<string, string> {
  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })

  const databaseSettings = database
    .prepare(
      `select s.userName, s.settingValue
        from UserSettings s
        where s.settingKey = 'apiKey'`
    )
    .all() as Array<{
    settingValue: string
    userName: string
  }>

  const apiKeys: Record<string, string> = {}

  for (const databaseSetting of databaseSettings) {
    const userName = databaseSetting.userName

    if (!loginUsers.includes(userName)) {
      continue
    }

    // eslint-disable-next-line security/detect-object-injection
    apiKeys[userName] = databaseSetting.settingValue
  }

  if (connectedDatabase === undefined) {


    database.close()


  }
  return apiKeys
}
