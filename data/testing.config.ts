import type { Config } from '../types/config.types.js'

import { config as cemeteryConfig } from './ssm.ontario.config.js'

export const config: Config = { ...cemeteryConfig }

config.application.useTestDatabases = true

config.session.doKeepAlive = true

config.users = {
  canLogin: ['*testView', '*testUpdate', '*testAdmin'],
  canUpdate: ['*testUpdate'],
  canUpdateWorkOrders: ['*testUpdate'],
  isAdmin: ['*testAdmin'],
  testing: ['*testView', '*testUpdate', '*testAdmin']
}

config.settings.publicInternalPath = 'public-internal'

config.settings.dynamicsGP!.integrationIsEnabled = false

export default config
