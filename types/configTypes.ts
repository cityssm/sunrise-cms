import type { config as MSSQLConfig } from 'mssql'

export interface Config {
  application: ConfigApplication
  session: ConfigSession
  reverseProxy: {
    disableCompression?: boolean
    disableEtag?: boolean
    urlPrefix?: string
  }
  activeDirectory?: ConfigActiveDirectory
  users: {
    testing?: Array<`*${string}`>
    canLogin?: string[]
    canUpdate?: string[]
    isAdmin?: string[]
  }
  aliases: {
    externalReceiptNumber?: string
    workOrderOpenDate?: string
    workOrderCloseDate?: string
  }
  settings: {
    cityDefault?: string
    provinceDefault?: string
    latitudeMin?: number
    latitudeMax?: number
    longitudeMin?: number
    longitudeMax?: number
    fees: {
      taxPercentageDefault?: number
    }
    burialSites: {
      burialSiteNameSegments?: ConfigBurialSiteNameSegments
    }
    contracts: {
      burialSiteIdIsRequired?: boolean
      contractEndDateIsRequired?: boolean
      purchaserRelationships?: string[]
      deathAgePeriods?: string[]
      prints?: string[]
    }
    workOrders: {
      workOrderNumberLength?: number
      workOrderMilestoneDateRecentBeforeDays?: number
      workOrderMilestoneDateRecentAfterDays?: number
      calendarEmailAddress?: string
      prints?: string[]
    }
    adminCleanup: {
      recordDeleteAgeDays?: number
    }
    printPdf: {
      contentDisposition?: 'attachment' | 'inline'
    }
    dynamicsGP?: {
      integrationIsEnabled: boolean
      mssqlConfig?: MSSQLConfig
      lookupOrder?: DynamicsGPLookup[]
      accountCodes?: string[]
      itemNumbers?: string[]
      trialBalanceCodes?: string[]
    }
  }
}

export type DynamicsGPLookup =
  | 'diamond/cashReceipt'
  | 'diamond/extendedInvoice'
  | 'invoice'

interface ConfigApplication {
  applicationName?: string
  backgroundURL?: string
  logoURL?: string
  httpPort?: number
  userDomain?: string
  useTestDatabases?: boolean
  ntfyStartup?: ConfigNtfyStartup
  maximumProcesses?: number
}

export interface ConfigNtfyStartup {
  topic: string
  server?: string
}

interface ConfigSession {
  cookieName?: string
  secret?: string
  maxAgeMillis?: number
  doKeepAlive?: boolean
}

export interface ConfigActiveDirectory {
  url: string
  baseDN: string
  username: string
  password: string
}

export interface ConfigBurialSiteNameSegments {
  separator?: string
  includeCemeteryKey?: boolean
  segments: Partial<
    Record<
      '1' | '2' | '3' | '4' | '5',
      {
        isAvailable?: boolean
        isRequired?: boolean
        label?: string
        prefix?: string
        suffix?: string
        minLength?: number
        maxLength?: number
      }
    >
  >
}
