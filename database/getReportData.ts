import {
  type DateString,
  dateIntegerToString,
  dateStringToInteger,
  dateToInteger,
  timeIntegerToString
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export type ReportParameters = Record<string, number | string>

const simpleReports: Record<`${string}-all` | `${string}-formatted`, string> = {
  'burialSiteComments-all': 'select * from BurialSiteComments',
  'burialSiteFields-all': 'select * from BurialSiteFields',
  'burialSites-all': 'select * from BurialSites',
  'burialSiteStatuses-all': 'select * from BurialSiteStatuses',
  'burialSiteTypeFields-all': 'select * from BurialSiteTypeFields',
  'burialSiteTypes-all': 'select * from BurialSiteTypes',

  'cemeteries-all': 'select * from Cemeteries',

  'cemeteries-formatted': /* sql */ `
    SELECT
      cemeteryName,
      cemeteryDescription,
      cemeteryAddress1,
      cemeteryAddress2,
      cemeteryCity,
      cemeteryProvince,
      cemeteryPostalCode,
      cemeteryPhoneNumber
    FROM
      Cemeteries
    WHERE
      recordDelete_timeMillis IS NULL
    ORDER BY
      cemeteryName
  `,

  'committalTypes-all': 'select * from CommittalTypes',
  'contractAttachments-all': 'select * from ContractAttachments',
  'contractComments-all': 'select * from ContractComments',
  'contractFees-all': 'select * from ContractFees',
  'contractFields-all': 'select * from ContractFields',
  'contractInterments-all': 'select * from ContractInterments',
  'contractMetadata-all': 'select * from ContractMetadata',
  'contracts-all': 'select * from Contracts',
  'contractTransactions-all': 'select * from ContractTransactions',
  'contractTypeFields-all': 'select * from ContractTypeFields',
  'contractTypePrints-all': 'select * from ContractTypePrints',
  'contractTypes-all': 'select * from ContractTypes',

  'feeCategories-all': 'select * from FeeCategories',
  'fees-all': 'select * from Fees',

  'funeralHomes-all': 'select * from FuneralHomes',

  'funeralHomes-formatted': /* sql */ `
    SELECT
      funeralHomeName,
      funeralHomeAddress1,
      funeralHomeAddress2,
      funeralHomeCity,
      funeralHomeProvince,
      funeralHomePostalCode,
      funeralHomePhoneNumber
    FROM
      FuneralHomes
    WHERE
      recordDelete_timeMillis IS NULL
  `,

  'intermentContainerTypes-all': 'select * from IntermentContainerTypes',

  'workOrderBurialSites-all': 'select * from WorkOrderBurialSites',
  'workOrderComments-all': 'select * from WorkOrderComments',
  'workOrderMilestones-all': 'select * from WorkOrderMilestones',
  'workOrderMilestoneTypes-all': 'select * from WorkOrderMilestoneTypes',
  'workOrders-all': 'select * from WorkOrders',
  'workOrderTypes-all': 'select * from WorkOrderTypes'
}

export default function getReportData(
  reportName: string,
  reportParameters: ReportParameters = {},
  connectedDatabase?: sqlite.Database
): unknown[] | undefined {
  let sql: string
  const sqlParameters: unknown[] = []

  // eslint-disable-next-line security/detect-object-injection
  if (simpleReports[reportName] === undefined) {
    switch (reportName) {
      case 'burialSites-byBurialSiteStatusId': {
        sql = /* sql */ `
          SELECT
            l.burialSiteId,
            m.cemeteryName,
            l.burialSiteName,
            t.burialSiteType,
            s.burialSiteStatus
          FROM
            BurialSites l
            LEFT JOIN BurialSiteTypes t ON l.burialSiteTypeId = t.burialSiteTypeId
            LEFT JOIN BurialSiteStatuses s ON l.burialSiteStatusId = s.burialSiteStatusId
            LEFT JOIN Cemeteries m ON l.cemeteryId = m.cemeteryId
          WHERE
            l.recordDelete_timeMillis IS NULL
            AND l.burialSiteStatusId = ?
        `

        sqlParameters.push(reportParameters.burialSiteStatusId)

        break
      }

      case 'burialSites-byBurialSiteTypeId': {
        sql = /* sql */ `
          SELECT
            l.burialSiteId,
            m.cemeteryName,
            l.burialSiteName,
            t.burialSiteType,
            s.burialSiteStatus
          FROM
            BurialSites l
            LEFT JOIN BurialSiteTypes t ON l.burialSiteTypeId = t.burialSiteTypeId
            LEFT JOIN BurialSiteStatuses s ON l.burialSiteStatusId = s.burialSiteStatusId
            LEFT JOIN Cemeteries m ON l.cemeteryId = m.cemeteryId
          WHERE
            l.recordDelete_timeMillis IS NULL
            AND l.burialSiteTypeId = ?
        `

        sqlParameters.push(reportParameters.burialSiteTypeId)

        break
      }

      case 'burialSites-byCemeteryId': {
        sql = /* sql */ `
          SELECT
            l.burialSiteId,
            m.cemeteryName,
            l.burialSiteName,
            t.burialSiteType,
            s.burialSiteStatus
          FROM
            BurialSites l
            LEFT JOIN BurialSiteTypes t ON l.burialSiteTypeId = t.burialSiteTypeId
            LEFT JOIN BurialSiteStatuses s ON l.burialSiteStatusId = s.burialSiteStatusId
            LEFT JOIN Cemeteries m ON l.cemeteryId = m.cemeteryId
          WHERE
            l.recordDelete_timeMillis IS NULL
            AND l.cemeteryId = ?
        `

        sqlParameters.push(reportParameters.cemeteryId)

        break
      }

      case 'contractInterments-byContractId': {
        sql = /* sql */ `
          SELECT
            i.contractId,
            c.contractNumber,
            i.intermentNumber,
            i.deceasedName,
            i.deceasedAddress1,
            i.deceasedAddress2,
            i.deceasedCity,
            i.deceasedProvince,
            i.deceasedPostalCode,
            i.birthDate,
            i.birthPlace,
            i.deathDate,
            i.deathPlace,
            i.deathAge,
            i.deathAgePeriod
          FROM
            ContractInterments i
            LEFT JOIN Contracts c ON i.contractId = c.contractId
            LEFT JOIN IntermentContainerTypes t ON i.intermentContainerTypeId = t.intermentContainerTypeId
          WHERE
            i.recordDelete_timeMillis IS NULL
            AND i.contractId = ?
        `

        sqlParameters.push(reportParameters.contractId)

        break
      }

      case 'contracts-current-byCemeteryId': {
        sql = /* sql */ `
          SELECT
            c.contractId,
            c.contractNumber,
            b.burialSiteName,
            cem.cemeteryName,
            ct.contractType,
            c.contractStartDate,
            c.contractEndDate
          FROM
            Contracts c
            LEFT JOIN ContractTypes ct ON c.contractTypeId = ct.contractTypeId
            LEFT JOIN BurialSites b ON c.burialSiteId = b.burialSiteId
            LEFT JOIN Cemeteries cem ON b.cemeteryId = cem.cemeteryId
          WHERE
            c.recordDelete_timeMillis IS NULL
            AND (
              c.contractEndDate IS NULL
              OR c.contractEndDate >= ?
            )
            AND b.cemeteryId = ?
        `

        sqlParameters.push(
          dateToInteger(new Date()),
          reportParameters.cemeteryId
        )

        break
      }

      case 'contractTransactions-byTransactionDateString': {
        sql = /* sql */ `
          SELECT
            t.contractId,
            c.contractNumber,
            t.transactionIndex,
            t.transactionDate,
            t.transactionTime,
            t.transactionAmount,
            t.isInvoiced,
            t.externalReceiptNumber,
            t.transactionNote
          FROM
            ContractTransactions t
            LEFT JOIN Contracts c ON t.contractId = c.contractId
          WHERE
            t.recordDelete_timeMillis IS NULL
            AND t.transactionDate = ?
        `

        sqlParameters.push(
          dateStringToInteger(
            reportParameters.transactionDateString as DateString
          )
        )
        break
      }

      case 'workOrderMilestones-byWorkOrderId': {
        sql = /* sql */ `
          SELECT
            t.workOrderMilestoneType,
            m.workOrderMilestoneDate,
            m.workOrderMilestoneTime,
            m.workOrderMilestoneDescription,
            m.workOrderMilestoneCompletionDate,
            m.workOrderMilestoneCompletionTime
          FROM
            WorkOrderMilestones m
            LEFT JOIN WorkOrderMilestoneTypes t ON m.workOrderMilestoneTypeId = t.workOrderMilestoneTypeId
          WHERE
            m.recordDelete_timeMillis IS NULL
            AND m.workOrderId = ?
        `

        sqlParameters.push(reportParameters.workOrderId)
        break
      }

      case 'workOrders-open': {
        sql = /* sql */ `
          SELECT
            w.workOrderId,
            w.workOrderNumber,
            t.workOrderType,
            w.workOrderDescription,
            w.workOrderOpenDate,
            m.workOrderMilestoneCount,
            m.workOrderMilestoneCompletionCount
          FROM
            WorkOrders w
            LEFT JOIN WorkOrderTypes t ON w.workOrderTypeId = t.workOrderTypeId
            LEFT JOIN (
              SELECT
                m.workOrderId,
                count(m.workOrderMilestoneId) AS workOrderMilestoneCount,
                sum(
                  CASE
                    WHEN m.workOrderMilestoneCompletionDate IS NULL THEN 0
                    ELSE 1
                  END
                ) AS workOrderMilestoneCompletionCount
              FROM
                WorkOrderMilestones m
              WHERE
                m.recordDelete_timeMillis IS NULL
              GROUP BY
                m.workOrderId
            ) m ON w.workOrderId = m.workOrderId
          WHERE
            w.recordDelete_timeMillis IS NULL
            AND w.workOrderCloseDate IS NULL
        `

        break
      }

      default: {
        return undefined
      }
    }
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, security/detect-object-injection
    sql = simpleReports[reportName]
  }

  const database = connectedDatabase ?? sqlite(sunriseDB)

  database.function('userFn_dateIntegerToString', dateIntegerToString)
  database.function('userFn_timeIntegerToString', timeIntegerToString)

  const rows = database.prepare(sql).all(sqlParameters)

  if (connectedDatabase === undefined) {
    database.close()
  }
  return rows
}
