import {
  type DateString,
  dateIntegerToString,
  dateStringToInteger,
  dateToInteger,
  timeIntegerToString
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import { simpleReports } from '../helpers/reports.helpers.js'

export type ReportParameters = Record<string, number | string>

export default function getReportData(
  reportName: string,
  reportParameters: ReportParameters = {},
  connectedDatabase?: sqlite.Database
): unknown[] | undefined {
  let sql: string
  const sqlParameters: unknown[] = []

  if (
    simpleReports.has(reportName as `${string}-all` | `${string}-formatted`)
  ) {
    sql = simpleReports.get(
      reportName as `${string}-all` | `${string}-formatted`
    ) as string
  } else {
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
            i.deathAgePeriod,
            i.intermentContainerTypeId,
            t.intermentContainerType,
            i.intermentDepthId,
            d.intermentDepth
          FROM
            ContractInterments i
            LEFT JOIN Contracts c ON i.contractId = c.contractId
            LEFT JOIN IntermentContainerTypes t ON i.intermentContainerTypeId = t.intermentContainerTypeId
            LEFT JOIN IntermentDepths d ON i.intermentDepthId = d.intermentDepthId
          WHERE
            i.recordDelete_timeMillis IS NULL
            AND i.contractId = ?
        `

        sqlParameters.push(reportParameters.contractId)

        break
      }

      case 'contractInterments-directory': {
        sql = /* sql */ `
          SELECT
            ci.deceasedName,
            ci.deathDate,
            ci.deathAge,
            ci.deathAgePeriod,
            cem.cemeteryName,
            bs.burialSiteName,
            bst.burialSiteType
          FROM
            ContractInterments ci
            LEFT JOIN Contracts c ON ci.contractId = c.contractId
            INNER JOIN BurialSites bs ON c.burialSiteId = bs.burialSiteId
            LEFT JOIN BurialSiteTypes bst ON bs.burialSiteTypeId = bst.burialSiteTypeId
            LEFT JOIN Cemeteries cem ON bs.cemeteryId = cem.cemeteryId
          WHERE
            ci.recordDelete_timeMillis IS NULL
            AND c.recordDelete_timeMillis IS NULL
            AND c.contractStartDate <= ?
            AND (
              c.contractEndDate IS NULL
              OR c.contractEndDate > ?
            )
            AND c.contractTypeId IN (
              SELECT
                contractTypeId
              FROM
                ContractTypes
              WHERE
                isPreneed = 0
            )
          ORDER BY
            ci.deceasedName,
            ci.deathDate
        `

        const currentDateInteger = dateToInteger(new Date())

        sqlParameters.push(currentDateInteger, currentDateInteger)

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
