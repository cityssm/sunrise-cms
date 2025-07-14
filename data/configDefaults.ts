import type {
  ActiveDirectoryAuthenticatorConfiguration,
  ADWebAuthAuthenticatorConfiguration,
  FunctionAuthenticatorConfiguration,
  PlainTextAuthenticatorConfiguration
} from '@cityssm/authentication-helper'
import { hoursToMillis } from '@cityssm/to-millis'
import type { config as MSSQLConfig } from 'mssql'

import type {
  ConfigBurialSiteNameSegments,
  ConfigNtfyStartup,
  DynamicsGPLookup
} from '../types/config.types.js'

export const configDefaultValues = {
  'application.applicationName': 'Sunrise CMS',
  'application.backgroundURL': '/images/cemetery-background.jpg',
  'application.httpPort': 9000,
  'application.logoURL': '/images/sunrise-cms.svg',
  'application.maximumProcesses': 4,
  'application.ntfyStartup': undefined as ConfigNtfyStartup | undefined,
  'application.useTestDatabases': false,

  'login.authentication': undefined as
    | {
        config: ActiveDirectoryAuthenticatorConfiguration
        type: 'activeDirectory'
      }
    | {
        config: ADWebAuthAuthenticatorConfiguration
        type: 'adWebAuth'
      }
    | {
        config: FunctionAuthenticatorConfiguration
        type: 'function'
      }
    | {
        config: PlainTextAuthenticatorConfiguration
        type: 'plainText'
      }
    | undefined,
  'login.domain': '',

  'reverseProxy.disableCompression': false,
  'reverseProxy.disableEtag': false,
  'reverseProxy.urlPrefix': '',

  'session.cookieName': 'sunrise-user-sid',
  'session.doKeepAlive': false,
  'session.maxAgeMillis': hoursToMillis(1),
  'session.secret': 'cityssm/sunrise',

  'users.canLogin': ['administrator'],
  'users.canUpdate': [] as string[],
  'users.canUpdateWorkOrders': [] as string[],
  'users.isAdmin': ['administrator'],
  'users.testing': [] as string[],

  'aliases.externalReceiptNumber': 'External Receipt Number',
  'aliases.workOrderCloseDate': 'Completion Date',
  'aliases.workOrderOpenDate': 'Order Date',

  'settings.cityDefault': '',
  'settings.provinceDefault': '',

  'settings.enableKeyboardShortcuts': true,
  'settings.publicInternalPath': 'public-internal',

  'settings.latitudeMax': 90,
  'settings.latitudeMin': -90,
  'settings.longitudeMax': 180,
  'settings.longitudeMin': -180,

  'settings.cemeteries.refreshImageChanges': false,

  // eslint-disable-next-line no-secrets/no-secrets
  'settings.burialSiteTypes.bodyCapacityMaxDefault': 2,

  // eslint-disable-next-line no-secrets/no-secrets
  'settings.burialSiteTypes.crematedCapacityMaxDefault': 6,

  'settings.burialSites.burialSiteNameSegments': {
    includeCemeteryKey: false,
    separator: '-',

    segments: {
      1: {
        isAvailable: true,
        isRequired: true,
        label: 'Plot Number',
        maxLength: 20,
        minLength: 1
      }
    }
  } as unknown as ConfigBurialSiteNameSegments,

  'settings.burialSites.burialSiteNameSegments.includeCemeteryKey': false,

  'settings.burialSites.refreshImageChanges': false,

  'settings.contracts.burialSiteIdIsRequired': true,
  'settings.contracts.contractEndDateIsRequired': false,

  'settings.contracts.prints': ['screen/contract'],

  'settings.fees.taxPercentageDefault': 0,

  'settings.workOrders.workOrderNumberLength': 6,

  'settings.workOrders.calendarEmailAddress': 'no-reply@127.0.0.1',
  'settings.workOrders.prints': ['pdf/workOrder', 'pdf/workOrder-commentLog'],
  'settings.workOrders.workOrderMilestoneDateRecentAfterDays': 60,
  'settings.workOrders.workOrderMilestoneDateRecentBeforeDays': 5,

  'settings.adminCleanup.recordDeleteAgeDays': 60,

  'settings.printPdf.browser': 'chrome' as 'chrome' | 'firefox',
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

export default configDefaultValues
