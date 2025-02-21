import type { Config } from '../types/configTypes.js'

export const config: Config = {
  application: {},
  session: {},
  reverseProxy: {},
  users: {},
  aliases: {},
  settings: {
    fees: {},
    cemeteries: {},
    contracts: {},
    workOrders: {},
    adminCleanup: {},
    printPdf: {},
    dynamicsGP: {
      integrationIsEnabled: false
    }
  }
}

export default config
