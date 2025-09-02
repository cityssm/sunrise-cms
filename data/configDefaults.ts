import type {
  ActiveDirectoryAuthenticatorConfiguration,
  ADWebAuthAuthenticatorConfiguration,
  FunctionAuthenticatorConfiguration,
  PlainTextAuthenticatorConfiguration
} from '@cityssm/authentication-helper'
import { hoursToMillis } from '@cityssm/to-millis'
import type { config as MSSQLConfig } from 'mssql'

import type { NtfyTopic } from '../integrations/ntfy/types.js'
import type {
  ConfigBurialSiteNameSegments,
  DynamicsGPLookup
} from '../types/config.types.js'

export const configDefaultValues = {
  'application.applicationName': 'Sunrise CMS',
  'application.applicationUrl': undefined as string | undefined,
  'application.backgroundURL': '/images/cemetery-background.jpg',
  'application.httpPort': 9000,
  'application.logoURL': '/images/sunrise-cms.svg',
  'application.maximumProcesses': 4,
  'application.useTestDatabases': false,

  'application.attachmentsPath': 'data/attachments',
  'application.maxAttachmentFileSize': 20,

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
  'reverseProxy.disableRateLimit': false,
  'reverseProxy.urlPrefix': '',

  'session.cookieName': 'sunrise-user-sid',
  'session.doKeepAlive': false,
  'session.maxAgeMillis': hoursToMillis(1),
  'session.secret': 'cityssm/sunrise',

  'users.canLogin': ['administrator'],

  'users.canUpdate': [] as string[],
  'users.canUpdateCemeteries': [] as string[],
  'users.canUpdateContracts': [] as string[],
  'users.canUpdateWorkOrders': [] as string[],

  'users.isAdmin': ['administrator'],
  'users.testing': [] as string[],

  'settings.cityDefault': '',
  'settings.provinceDefault': '',

  'settings.customizationsPath': '.',
  'settings.enableKeyboardShortcuts': true,

  'settings.latitudeMax': 90,
  'settings.latitudeMin': -90,
  'settings.longitudeMax': 180,
  'settings.longitudeMin': -180,

  'settings.cemeteries.refreshImageChanges': false,

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

  'settings.adminCleanup.recordDeleteAgeDays': 60,

  'settings.printPdf.browser': 'chrome' as 'chrome' | 'firefox',
  'settings.printPdf.contentDisposition': 'attachment' as
    | 'attachment'
    | 'inline',

  'settings.databaseBackup.taskIsEnabled': false,
  'settings.databaseBackup.backupHour': 2,
  'settings.databaseBackup.deleteAgeDays': 0,

  // Dynamics GP

  'integrations.dynamicsGP.integrationIsEnabled': false,
  'integrations.dynamicsGP.mssqlConfig': undefined as unknown as MSSQLConfig,

  // eslint-disable-next-line no-secrets/no-secrets
  'integrations.dynamicsGP.lookupOrder': ['invoice'] as DynamicsGPLookup[],

  'integrations.dynamicsGP.accountCodes': [] as string[],
  'integrations.dynamicsGP.itemNumbers': [] as string[],
  'integrations.dynamicsGP.trialBalanceCodes': [] as string[],

  // Consigno Cloud

  'integrations.consignoCloud.integrationIsEnabled': false,

  'integrations.consignoCloud.apiKey': '',
  'integrations.consignoCloud.apiSecret': '',
  'integrations.consignoCloud.baseUrl': '',

  // Ntfy

  'integrations.ntfy.integrationIsEnabled': false,
  'integrations.ntfy.server': '',
  'integrations.ntfy.topics': {} as unknown as Partial<Record<NtfyTopic, string>>,
}

export default configDefaultValues
