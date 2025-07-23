import type { Config } from '../types/config.types.js'

export const config: Config = {
  application: {},
  reverseProxy: {},
  session: {},
  settings: {
    adminCleanup: {},
    burialSites: {},
    burialSiteTypes: {},
    cemeteries: {},
    contracts: {},
    dynamicsGP: {
      integrationIsEnabled: false
    },
    fees: {},
    printPdf: {},
    workOrders: {}
  },
  users: {}
}

export default config
