// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable security/detect-object-injection */

import * as dateTimeFunctions from '@cityssm/utils-datetime'

import getBurialSite from '../database/getBurialSite.js'
import getContract from '../database/getContract.js'
import getWorkOrder from '../database/getWorkOrder.js'
import type { BurialSite, Contract, WorkOrder } from '../types/recordTypes.js'

import * as contractFunctions from './contracts.helpers.js'
import * as configFunctions from './config.helpers.js'

interface PrintConfig {
  title: string
  params: string[]
}

interface ReportData {
  headTitle: string

  burialSite?: BurialSite
  contract?: Contract
  workOrder?: WorkOrder

  configFunctions: unknown
  dateTimeFunctions: unknown
  contractFunctions: unknown
}

const screenPrintConfigs: Record<string, PrintConfig> = {
  contract: {
    title: `Burial Site Contract Print`,
    params: ['contractId']
  }
}

export function getScreenPrintConfig(
  printName: string
): PrintConfig | undefined {
  return screenPrintConfigs[printName]
}

const pdfPrintConfigs: Record<string, PrintConfig> = {
  workOrder: {
    title: 'Work Order Field Sheet',
    params: ['workOrderId']
  },
  'workOrder-commentLog': {
    title: 'Work Order Field Sheet - Comment Log',
    params: ['workOrderId']
  },

  // Occupancy
  'ssm.cemetery.burialPermit': {
    title: 'Burial Permit',
    params: ['contractId']
  },
  'ssm.cemetery.contract': {
    title: 'Contract for Purchase of Interment Rights',
    params: ['contractId']
  }
}

export function getPdfPrintConfig(printName: string): PrintConfig | undefined {
  return pdfPrintConfigs[printName]
}

export function getPrintConfig(
  screenOrPdfPrintName: string
): PrintConfig | undefined {
  const printNameSplit = screenOrPdfPrintName.split('/')

  switch (printNameSplit[0]) {
    case 'screen': {
      return getScreenPrintConfig(printNameSplit[1])
    }
    case 'pdf': {
      return getPdfPrintConfig(printNameSplit[1])
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
    dateTimeFunctions,
    contractFunctions
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
