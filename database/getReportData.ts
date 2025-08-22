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
  'cemeteries-formatted': `select cemeteryName,
    cemeteryDescription,
    cemeteryAddress1, cemeteryAddress2,
    cemeteryCity, cemeteryProvince,
    cemeteryPostalCode,
    cemeteryPhoneNumber
    from Cemeteries
    where recordDelete_timeMillis is null
    order by cemeteryName`,

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
  'funeralHomes-formatted': `select funeralHomeName,
    funeralHomeAddress1, funeralHomeAddress2,
    funeralHomeCity, funeralHomeProvince,
    funeralHomePostalCode,
    funeralHomePhoneNumber
    from FuneralHomes
    where recordDelete_timeMillis is null`,

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
  reportParameters: ReportParameters = {}
, connectedDatabase?: sqlite.Database): unknown[] | undefined {
  let sql = ''
  const sqlParameters: unknown[] = []

  // eslint-disable-next-line security/detect-object-injection
  if (simpleReports[reportName] === undefined) {
    switch (reportName) {
      case 'burialSites-byBurialSiteStatusId': {
        sql = `select l.burialSiteId,
          m.cemeteryName,
          l.burialSiteName,
          t.burialSiteType,
          s.burialSiteStatus
          from BurialSites l
          left join BurialSiteTypes t on l.burialSiteTypeId = t.burialSiteTypeId
          left join BurialSiteStatuses s on l.burialSiteStatusId = s.burialSiteStatusId
          left join Cemeteries m on l.cemeteryId = m.cemeteryId
          where l.recordDelete_timeMillis is null
          and l.burialSiteStatusId = ?`

        sqlParameters.push(reportParameters.burialSiteStatusId)

        break
      }

      case 'burialSites-byBurialSiteTypeId': {
        sql = `select l.burialSiteId,
          m.cemeteryName,
          l.burialSiteName,
          t.burialSiteType,
          s.burialSiteStatus
          from BurialSites l
          left join BurialSiteTypes t on l.burialSiteTypeId = t.burialSiteTypeId
          left join BurialSiteStatuses s on l.burialSiteStatusId = s.burialSiteStatusId
          left join Cemeteries m on l.cemeteryId = m.cemeteryId
          where l.recordDelete_timeMillis is null
          and l.burialSiteTypeId = ?`

        sqlParameters.push(reportParameters.burialSiteTypeId)

        break
      }

      case 'burialSites-byCemeteryId': {
        sql = `select l.burialSiteId,
          m.cemeteryName,
          l.burialSiteName,
          t.burialSiteType,
          s.burialSiteStatus
          from BurialSites l
          left join BurialSiteTypes t on l.burialSiteTypeId = t.burialSiteTypeId
          left join BurialSiteStatuses s on l.burialSiteStatusId = s.burialSiteStatusId
          left join Cemeteries m on l.cemeteryId = m.cemeteryId
          where l.recordDelete_timeMillis is null
          and l.cemeteryId = ?`

        sqlParameters.push(reportParameters.cemeteryId)

        break
      }

      case 'contractInterments-byContractId': {
        sql = `select i.contractId, i.intermentNumber,
          i.deceasedName, i.deceasedAddress1, i.deceasedAddress2,
          i.deceasedCity, i.deceasedProvince, i.deceasedPostalCode,
          i.birthDate, i.birthPlace,
          i.deathDate, i.deathPlace,
          i.deathAge, i.deathAgePeriod
          from ContractInterments i
          left join IntermentContainerTypes t on i.intermentContainerTypeId = t.intermentContainerTypeId
          where i.recordDelete_timeMillis is null
          and i.contractId = ?`

        sqlParameters.push(reportParameters.contractId)

        break
      }

      case 'contracts-current-byCemeteryId': {
        sql = `select o.contractId,
          l.burialSiteName,
          m.cemeteryName,
          ot.contractType,
          o.contractStartDate,
          o.contractEndDate
          from Contracts o
          left join ContractTypes ot on o.contractTypeId = ot.contractTypeId
          left join BurialSites l on o.burialSiteId = l.burialSiteId
          left join Cemeteries m on l.cemeteryId = m.cemeteryId
          where o.recordDelete_timeMillis is null
          and (o.contractEndDate is null or o.contractEndDate >= ?)
          and l.cemeteryId = ?`

        sqlParameters.push(
          dateToInteger(new Date()),
          reportParameters.cemeteryId
        )

        break
      }

      case 'contractTransactions-byTransactionDateString': {
        sql = `select t.contractId, t.transactionIndex,
          t.transactionDate, t.transactionTime,
          t.transactionAmount,
          t.isInvoiced,
          t.externalReceiptNumber, t.transactionNote
          from ContractTransactions t
          where t.recordDelete_timeMillis is null
          and t.transactionDate = ?`

        sqlParameters.push(
          dateStringToInteger(
            reportParameters.transactionDateString as DateString
          )
        )
        break
      }

      case 'workOrderMilestones-byWorkOrderId': {
        sql = `select t.workOrderMilestoneType,
          m.workOrderMilestoneDate,
          m.workOrderMilestoneTime,
          m.workOrderMilestoneDescription,
          m.workOrderMilestoneCompletionDate,
          m.workOrderMilestoneCompletionTime
          from WorkOrderMilestones m
          left join WorkOrderMilestoneTypes t on m.workOrderMilestoneTypeId = t.workOrderMilestoneTypeId
          where m.recordDelete_timeMillis is null
          and m.workOrderId = ?`

        sqlParameters.push(reportParameters.workOrderId)
        break
      }

      case 'workOrders-open': {
        sql = `select w.workOrderId, w.workOrderNumber,
          t.workOrderType, w.workOrderDescription,
          w.workOrderOpenDate,
          m.workOrderMilestoneCount, m.workOrderMilestoneCompletionCount
          from WorkOrders w
          left join WorkOrderTypes t on w.workOrderTypeId = t.workOrderTypeId
          left join (
            select m.workOrderId,
            count(m.workOrderMilestoneId) as workOrderMilestoneCount,
            sum(case when m.workOrderMilestoneCompletionDate is null then 0 else 1 end) as workOrderMilestoneCompletionCount
            from WorkOrderMilestones m
            where m.recordDelete_timeMillis is null
            group by m.workOrderId
          ) m on w.workOrderId = m.workOrderId
          where w.recordDelete_timeMillis is null
          and w.workOrderCloseDate is null`

        break
      }

      default: {
        return undefined
      }
    }
  } else {
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
