import type { Config } from '../types/configTypes.js'

import { config as cemeteryConfig } from './config.baseOntario.js'

export const config: Config = { ...cemeteryConfig }

config.aliases.externalReceiptNumber = 'GP Receipt Number'

config.settings.burialSites.burialSiteNameSegments = {
  separator: '-',
  includeCemeteryKey: true,
  segments: {
    1: {
      isRequired: false,
      isAvailable: true,
      label: 'Block',
      minLength: 1,
      maxLength: 1
    },
    2: {
      isRequired: true,
      isAvailable: true,
      label: 'Range',
      minLength: 1,
      maxLength: 3
    },
    3: {
      isRequired: true,
      isAvailable: true,
      label: 'Lot',
      minLength: 1,
      maxLength: 4
    },
    4: {
      isRequired: true,
      isAvailable: true,
      label: 'Grave',
      minLength: 1,
      maxLength: 2
    }
  }
}

config.settings.cityDefault = 'Sault Ste. Marie'

config.settings.contracts.prints = [
  'pdf/ssm.cemetery.burialPermit',
  'pdf/ssm.cemetery.contract'
]

config.settings.workOrders.workOrderNumberLength = 6
config.settings.workOrders.workOrderMilestoneDateRecentBeforeDays = 7
config.settings.workOrders.workOrderMilestoneDateRecentAfterDays = 30

config.settings.dynamicsGP = {
  integrationIsEnabled: true,
  lookupOrder: ['diamond/cashReceipt', 'diamond/extendedInvoice']
}

export default config
