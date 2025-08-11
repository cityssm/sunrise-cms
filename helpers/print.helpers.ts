// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable security/detect-object-injection */

import * as dateTimeFunctions from '@cityssm/utils-datetime'
import type { PrintConfig } from 'sunrise-cms-customizations'

import getBurialSite from '../database/getBurialSite.js'
import getContract from '../database/getContract.js'
import getWorkOrder from '../database/getWorkOrder.js'
import type { BurialSite, Contract, WorkOrder } from '../types/record.types.js'

import { getCachedSettingValue } from './cache/settings.cache.js'
import * as configFunctions from './config.helpers.js'
import * as contractFunctions from './contracts.helpers.js'
import { getCustomizationPdfPrintConfigs } from './customizations.helpers.js'

interface ReportData {
  headTitle: string

  burialSite?: BurialSite
  contract?: Contract
  workOrder?: WorkOrder

  configFunctions: typeof configFunctions
  contractFunctions: typeof contractFunctions
  dateTimeFunctions: typeof dateTimeFunctions
  settingFunctions: {
    getSettingValue: typeof getCachedSettingValue
  }
}

export interface PrintConfigWithPath extends PrintConfig {
  path: string
}

const screenPrintConfigs: Record<string, PrintConfig> = {
  contract: {
    params: ['contractId'],
    title: 'Burial Site Contract Print'
  }
}

export function getScreenPrintConfig(
  printName: string
): PrintConfig | undefined {
  return screenPrintConfigs[printName]
}

// Included PDF print configs
const pdfPrintConfigs: Record<string, PrintConfigWithPath> = {
  workOrder: {
    path: 'views/print/pdf/workOrder.ejs',

    params: ['workOrderId'],
    title: 'Work Order Field Sheet'
  },
  'workOrder-commentLog': {
    path: 'views/print/pdf/workOrder-commentLog.ejs',

    params: ['workOrderId'],
    title: 'Work Order Field Sheet - Comment Log'
  }
}

// Add customizations PDF print configs
for (const [printName, printConfig] of Object.entries(
  getCustomizationPdfPrintConfigs()
)) {
  pdfPrintConfigs[printName] = {
    ...printConfig,
    path: `${configFunctions.getConfigProperty('settings.customizationsPath')}/views/print/pdf/${printName}.ejs`
  }
}

export function getPdfPrintConfig(
  printName: string
): PrintConfigWithPath | undefined {
  return pdfPrintConfigs[printName]
}

export function getPrintConfig(
  screenOrPdfPrintName: string
): PrintConfig | undefined {
  const printNameSplit = screenOrPdfPrintName.split('/')

  switch (printNameSplit[0]) {
    case 'pdf': {
      return getPdfPrintConfig(printNameSplit[1])
    }
    case 'screen': {
      return getScreenPrintConfig(printNameSplit[1])
    }
  }

  return undefined
}

export async function getReportData(
  printConfig: PrintConfig,
  requestQuery: Record<string, unknown>
): Promise<ReportData> {
  const reportData: ReportData = {
    headTitle: printConfig.title,

    configFunctions,
    contractFunctions,
    dateTimeFunctions,
    settingFunctions: {
      getSettingValue: getCachedSettingValue
    }
  }

  if (
    printConfig.params.includes('contractId') &&
    typeof requestQuery.contractId === 'string'
  ) {
    const contract = await getContract(requestQuery.contractId)

    if (contract !== undefined && (contract.burialSiteId ?? -1) !== -1) {
      reportData.burialSite = await getBurialSite(contract.burialSiteId ?? -1)
    }

    reportData.contract = contract
  }

  if (
    printConfig.params.includes('workOrderId') &&
    typeof requestQuery.workOrderId === 'string'
  ) {
    reportData.workOrder = await getWorkOrder(requestQuery.workOrderId, {
      includeBurialSites: true,
      includeComments: true,
      includeMilestones: true
    })
  }

  return reportData
}
