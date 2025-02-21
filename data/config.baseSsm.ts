import type { Config } from '../types/configTypes.js'

import { config as cemeteryConfig } from './config.baseOntario.js'

export const config: Config = { ...cemeteryConfig }

config.aliases.externalReceiptNumber = 'GP Receipt Number'

config.settings.contracts.cityDefault = 'Sault Ste. Marie'
config.settings.contracts.prints = [
  'pdf/ssm.cemetery.burialPermit',
  'pdf/ssm.cemetery.contract'
]

config.settings.cemeteries.cityDefault = 'Sault Ste. Marie'

config.settings.workOrders.workOrderNumberLength = 6
config.settings.workOrders.workOrderMilestoneDateRecentBeforeDays = 7
config.settings.workOrders.workOrderMilestoneDateRecentAfterDays = 30

config.settings.dynamicsGP = {
  integrationIsEnabled: true,
  lookupOrder: ['diamond/cashReceipt', 'diamond/extendedInvoice']
}

export default config
