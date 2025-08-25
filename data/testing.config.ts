import type { Config } from '../types/config.types.js'

import { config as cemeteryConfig } from './partialConfigs/ontario.partialConfig.js'

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
  isAdmin: ['*testAdmin'],
  testing: ['*testView', '*testUpdate', '*testAdmin']
}

config.integrations.dynamicsGP!.integrationIsEnabled = false

config.settings.burialSites.burialSiteNameSegments = {
  includeCemeteryKey: true,
  separator: '-',

  segments: {
    1: {
      isAvailable: true,
      isRequired: false,
      label: 'Range',
      maxLength: 4,
      minLength: 1
    },
    2: {
      isAvailable: true,
      isRequired: false,
      label: 'Lot',
      maxLength: 4,
      minLength: 1
    },
    3: {
      isAvailable: true,
      isRequired: true,
      label: 'Grave',
      maxLength: 4,
      minLength: 1
    }
  }
}

export default config
