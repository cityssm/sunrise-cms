import { DatabaseSync } from 'node:sqlite'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

const loginUsers = getConfigProperty('users.canLogin')

export default function getApiKeys(
  connectedDatabase?: DatabaseSync
): Record<string, string> {
  const database =
    connectedDatabase ?? new DatabaseSync(sunriseDB, { readOnly: true })

  const databaseSettings = database
    .prepare(/* sql */ `
      SELECT
        s.username,
        s.settingValue
      FROM
        UserSettings s
      WHERE
        s.settingKey = 'apiKey'
    `)
    .all() as Array<{
    settingValue: string
    username: string
  }>

  const apiKeys: Record<string, string> = {}

  for (const databaseSetting of databaseSettings) {
    const username = databaseSetting.username

    if (!loginUsers.includes(username)) {
      continue
    }

    apiKeys[username] = databaseSetting.settingValue
  }

  if (connectedDatabase === undefined) {
    database.close()
  }
  return apiKeys
}
