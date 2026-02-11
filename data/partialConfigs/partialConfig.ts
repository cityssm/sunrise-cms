import type { Config } from '../../types/config.types.js'

export const config: Config = {
  application: {},
  reverseProxy: {},
  session: {},

  settings: {
    burialSites: {},
    cemeteries: {},
    contracts: {},
    fees: {},
    workOrders: {},

    printPdf: {},

    adminCleanup: {},

    databaseBackup: {
      taskIsEnabled: false
    }
  },

  integrations: {
    consignoCloud: {
      integrationIsEnabled: false
    },
    dynamicsGP: {
      integrationIsEnabled: false
    }
  },

  users: {}
}

export default config
