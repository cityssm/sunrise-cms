import type { Config } from '../../types/config.types.js'

export const config: Config = {
  application: {},
  reverseProxy: {},
  session: {},

  settings: {
    adminCleanup: {},
    burialSites: {},
    cemeteries: {},
    contracts: {},
    fees: {},
    printPdf: {},
    workOrders: {},
    databaseBackup: {}
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
