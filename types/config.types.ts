import type {
  ActiveDirectoryAuthenticatorConfiguration,
  ADWebAuthAuthenticatorConfiguration,
  FunctionAuthenticatorConfiguration,
  PlainTextAuthenticatorConfiguration
} from '@cityssm/authentication-helper'
import type { ConsignoCloudAPIConfig } from '@cityssm/consigno-cloud-api'
import type { config as MSSQLConfig } from 'mssql'

import type { NtfyTopic } from '../integrations/ntfy/types.js'

export interface Config {
  application: ConfigApplication

  session: ConfigSession

  reverseProxy: {
    disableCompression?: boolean
    disableEtag?: boolean
    disableRateLimit?: boolean
    urlPrefix?: string
  }

  login?: {
    authentication:
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
    domain: string
  }

  users: {
    testing?: Array<`*${string}`>

    canLogin?: string[]

    canUpdate?: string[]

    canUpdateCemeteries?: string[]
    canUpdateContracts?: string[]
    canUpdateWorkOrders?: string[]

    isAdmin?: string[]
  }

  settings: {
    cityDefault?: string
    provinceDefault?: string

    enableKeyboardShortcuts?: boolean

    latitudeMax?: number
    latitudeMin?: number
    longitudeMax?: number
    longitudeMin?: number

    customizationsPath?: string

    fees: {
      taxPercentageDefault?: number
    }

    cemeteries: {
      refreshImageChanges?: boolean
    }

    burialSites: {
      burialSiteNameSegments?: ConfigBurialSiteNameSegments
      refreshImageChanges?: boolean
    }

    contracts: {
      burialSiteIdIsRequired?: boolean
      contractEndDateIsRequired?: boolean
      prints?: string[]
    }

    workOrders: {
      calendarEmailAddress?: string
      prints?: string[]
      workOrderMilestoneDateRecentAfterDays?: number
      workOrderMilestoneDateRecentBeforeDays?: number
      workOrderNumberLength?: number
    }

    adminCleanup: {
      recordDeleteAgeDays?: number
    }

    printPdf: {
      browser?: 'chrome' | 'firefox'
      contentDisposition?: 'attachment' | 'inline'
    }
  }

  integrations: {
    dynamicsGP?: {
      integrationIsEnabled: boolean
      mssqlConfig?: MSSQLConfig

      accountCodes?: string[]
      itemNumbers?: string[]
      lookupOrder?: DynamicsGPLookup[]
      trialBalanceCodes?: string[]
    }

    consignoCloud?: Partial<ConsignoCloudAPIConfig> & {
      integrationIsEnabled: boolean
    }

    ntfy?: {
      integrationIsEnabled: boolean
      server?: string
      topics?: Partial<Record<NtfyTopic, string>>
    }
  }
}

export type DynamicsGPLookup =
  | 'diamond/cashReceipt'
  | 'diamond/extendedInvoice'
  | 'invoice'

interface ConfigApplication {
  applicationName?: string
  httpPort?: number

  backgroundURL?: string
  logoURL?: string

  maximumProcesses?: number
  useTestDatabases?: boolean

  attachmentsPath?: string

  /** In megabytes */
  maxAttachmentFileSize?: number
}

interface ConfigSession {
  cookieName?: string
  maxAgeMillis?: number
  secret?: string

  doKeepAlive?: boolean
}

export interface ConfigBurialSiteNameSegments {
  includeCemeteryKey?: boolean
  segments: Partial<
    Record<
      '1' | '2' | '3' | '4' | '5',
      {
        isAvailable?: boolean
        isRequired?: boolean
        label?: string
        maxLength?: number
        minLength?: number
        prefix?: string
        suffix?: string
      }
    >
  >
  separator?: string
}
