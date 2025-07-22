import type { Config } from '../types/config.types.js'

import { config as cemeteryConfig } from './ssm.ontario.config.js'

export const config: Config = { ...cemeteryConfig }

config.application.useTestDatabases = true

config.login = {
  authentication: {
    config: {
      authenticate: (userName: string, password: string) => {
        if (userName === '' || password === '') {
          return false
        }

        return (
          (config.application.useTestDatabases ?? false) &&
          `${config.login?.domain}\\${userName}` === password
        )
      }
    },
    type: 'function'
  },
  domain: ''
}

config.session.doKeepAlive = true

config.users = {
  canLogin: ['*testView', '*testUpdate', '*testAdmin'],
  canUpdate: ['*testUpdate'],
  canUpdateWorkOrders: ['*testUpdate'],
  isAdmin: ['*testAdmin'],
  testing: ['*testView', '*testUpdate', '*testAdmin']
}

config.settings.dynamicsGP!.integrationIsEnabled = false

export default config
