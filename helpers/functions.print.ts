import * as dateTimeFunctions from '@cityssm/utils-datetime'

import getBurialSite from '../database/getBurialSite.js'
import getBurialSiteContract from '../database/getBurialSiteContract.js'
import getWorkOrder from '../database/getWorkOrder.js'
import type { BurialSite, BurialSiteContract, WorkOrder } from '../types/recordTypes.js'

import * as burialSiteContractFunctions from './burialSiteContracts.helpers.js'
import * as configFunctions from './config.helpers.js'

interface PrintConfig {
  title: string
  params: string[]
}

interface ReportData {
  headTitle: string

  burialSite?: BurialSite
  burialSiteContract?: BurialSiteContract
  workOrder?: WorkOrder

  configFunctions: unknown
  dateTimeFunctions: unknown
  burialSiteContractFunctions: unknown
}

const screenPrintConfigs: Record<string, PrintConfig> = {
  burialSiteContract: {
    title: `Burial Site Contract Print`,
    params: ['burialSiteContractId']
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
    params: ['burialSiteContractId']
  },
  'ssm.cemetery.contract': {
    title: 'Contract for Purchase of Interment Rights',
    params: ['burialSiteContractId']
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
    burialSiteContractFunctions
  }

  if (
    printConfig.params.includes('burialSiteContractId') &&
    typeof requestQuery.burialSiteContractId === 'string'
  ) {
    const burialSiteContract = await getBurialSiteContract(requestQuery.burialSiteContractId)

    if (burialSiteContract !== undefined && (burialSiteContract.burialSiteId ?? -1) !== -1) {
      reportData.burialSite = await getBurialSite(burialSiteContract.burialSiteId ?? -1)
    }

    reportData.burialSiteContract = burialSiteContract
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
