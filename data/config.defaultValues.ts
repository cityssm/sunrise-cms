import { hoursToMillis } from '@cityssm/to-millis'
import type { config as MSSQLConfig } from 'mssql'

import type {
  ConfigActiveDirectory,
  ConfigBurialSiteNameSegments,
  ConfigNtfyStartup,
  DynamicsGPLookup
} from '../types/configTypes.js'

export const configDefaultValues = {
  activeDirectory: undefined as unknown as ConfigActiveDirectory,

  'application.applicationName': 'Sunrise CMS',
  'application.backgroundURL': '/images/cemetery-background.jpg',
  'application.logoURL': '/images/sunrise-cms.svg',
  'application.httpPort': 9000,
  'application.userDomain': '',
  'application.useTestDatabases': false,
  'application.maximumProcesses': 4,

  'application.ntfyStartup': undefined as ConfigNtfyStartup | undefined,

  'reverseProxy.disableCompression': false,
  'reverseProxy.disableEtag': false,
  'reverseProxy.urlPrefix': '',

  'session.cookieName': 'sunrise-user-sid',
  'session.secret': 'cityssm/sunrise',
  'session.maxAgeMillis': hoursToMillis(1),
  'session.doKeepAlive': false,

  'users.testing': [] as string[],
  'users.canLogin': ['administrator'],
  'users.canUpdate': [] as string[],
  'users.isAdmin': ['administrator'],

  'aliases.externalReceiptNumber': 'External Receipt Number',
  'aliases.workOrderOpenDate': 'Order Date',
  'aliases.workOrderCloseDate': 'Completion Date',

  'settings.cityDefault': '',
  'settings.provinceDefault': '',

  'settings.latitudeMin': -90,
  'settings.latitudeMax': 90,
  'settings.longitudeMin': -180,
  'settings.longitudeMax': 180,

  'settings.burialSites.burialSiteNameSegments': {
    separator: '-',
    includeCemeteryKey: false,
    segments: {
      1: {
        isRequired: true,
        isAvailable: true,
        label: 'Plot Number',
        minLength: 1,
        maxLength: 20
      }
    }
  } as unknown as ConfigBurialSiteNameSegments,

  'settings.burialSites.burialSiteNameSegments.includeCemeteryKey': false,

  'settings.contracts.burialSiteIdIsRequired': true,
  'settings.contracts.contractEndDateIsRequired': false,
  'settings.contracts.purchaserRelationships': [
    'Spouse',
    'Child',
    'Parent',
    'Sibling',
    'Friend',
    'Self'
  ],
  'settings.contracts.deathAgePeriods': [
    'Years',
    'Months',
    'Days',
    'Stillborn'
  ],
  'settings.contracts.prints': ['screen/contract'],

  'settings.fees.taxPercentageDefault': 0,

  'settings.workOrders.workOrderNumberLength': 6,

  'settings.workOrders.workOrderMilestoneDateRecentBeforeDays': 5,
  'settings.workOrders.workOrderMilestoneDateRecentAfterDays': 60,
  'settings.workOrders.calendarEmailAddress': 'no-reply@127.0.0.1',
  'settings.workOrders.prints': ['pdf/workOrder', 'pdf/workOrder-commentLog'],

  'settings.adminCleanup.recordDeleteAgeDays': 60,

  'settings.printPdf.contentDisposition': 'attachment' as
    | 'attachment'
    | 'inline',

  'settings.dynamicsGP.integrationIsEnabled': false,
  'settings.dynamicsGP.mssqlConfig': undefined as unknown as MSSQLConfig,

  // eslint-disable-next-line no-secrets/no-secrets
  'settings.dynamicsGP.lookupOrder': ['invoice'] as DynamicsGPLookup[],

  'settings.dynamicsGP.accountCodes': [] as string[],
  'settings.dynamicsGP.itemNumbers': [] as string[],
  'settings.dynamicsGP.trialBalanceCodes': [] as string[]
}
