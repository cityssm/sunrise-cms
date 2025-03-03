import { dateIntegerToString, dateStringToInteger, dateToInteger, timeIntegerToString } from '@cityssm/utils-datetime';
import { acquireConnection } from './pool.js';
// eslint-disable-next-line complexity
export default async function getReportData(reportName, reportParameters = {}) {
    let sql = '';
    const sqlParameters = [];
    switch (reportName) {
        case 'cemeteries-all': {
            sql = 'select * from Maps';
            break;
        }
        case 'cemeteries-formatted': {
            sql = `select cemeteryName,
        cemeteryDescription,
        cemeteryAddress1, cemeteryAddress2,
        cemeteryCity, cemeteryProvince,
        cemeteryPostalCode,
        cemeteryPhoneNumber
        from Cemeteries
        where recordDelete_timeMillis is null
        order by cemeteryName`;
            break;
        }
        case 'burialSites-all': {
            sql = 'select * from BurialSites';
            break;
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
        and l.burialSiteTypeId = ?`;
            sqlParameters.push(reportParameters.burialSiteTypeId);
            break;
        }
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
        and l.burialSiteStatusId = ?`;
            sqlParameters.push(reportParameters.burialSiteStatusId);
            break;
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
        and l.cemeteryId = ?`;
            sqlParameters.push(reportParameters.cemeteryId);
            break;
        }
        case 'burialSiteComments-all': {
            sql = 'select * from BurialSiteComments';
            break;
        }
        case 'burialSiteFields-all': {
            sql = 'select * from BurialSiteFields';
            break;
        }
        case 'contracts-all': {
            sql = 'select * from Contracts';
            break;
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
        and l.cemeteryId = ?`;
            sqlParameters.push(dateToInteger(new Date()), reportParameters.cemeteryId);
            break;
        }
        case 'contractComments-all': {
            sql = 'select * from ContractComments';
            break;
        }
        case 'contractFees-all': {
            sql = 'select * from ContractFees';
            break;
        }
        case 'contractFields-all': {
            sql = 'select * from ContractFields';
            break;
        }
        case 'contractTransactions-all': {
            sql = 'select * from ContractTransactions';
            break;
        }
        case 'contractTransactions-byTransactionDateString': {
            sql = `select t.contractId, t.transactionIndex,
        t.transactionDate, t.transactionTime,
        t.transactionAmount,
        t.externalReceiptNumber, t.transactionNote
        from ContractTransactions t
        where t.recordDelete_timeMillis is null
        and t.transactionDate = ?`;
            sqlParameters.push(dateStringToInteger(reportParameters.transactionDateString));
            break;
        }
        case 'workOrders-all': {
            sql = 'select * from WorkOrders';
            break;
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
        and w.workOrderCloseDate is null`;
            break;
        }
        case 'workOrderComments-all': {
            sql = 'select * from WorkOrderComments';
            break;
        }
        case 'workOrderLots-all': {
            sql = 'select * from WorkOrderLots';
            break;
        }
        case 'workOrderMilestones-all': {
            sql = 'select * from WorkOrderMilestones';
            break;
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
        and m.workOrderId = ?`;
            sqlParameters.push(reportParameters.workOrderId);
            break;
        }
        case 'fees-all': {
            sql = 'select * from Fees';
            break;
        }
        case 'feeCategories-all': {
            sql = 'select * from FeeCategories';
            break;
        }
        case 'burialSiteTypes-all': {
            sql = 'select * from BurialSiteTypes';
            break;
        }
        case 'burialSiteTypeFields-all': {
            sql = 'select * from BurialSiteTypeFields';
            break;
        }
        case 'burialSiteStatuses-all': {
            sql = 'select * from BurialSiteStatuses';
            break;
        }
        case 'contractTypes-all': {
            sql = 'select * from ContractTypes';
            break;
        }
        case 'contractTypeFields-all': {
            sql = 'select * from ContractTypeFields';
            break;
        }
        case 'workOrderTypes-all': {
            sql = 'select * from WorkOrderTypes';
            break;
        }
        case 'workOrderMilestoneTypes-all': {
            sql = 'select * from WorkOrderMilestoneTypes';
            break;
        }
        default: {
            return undefined;
        }
    }
    const database = await acquireConnection();
    database.function('userFn_dateIntegerToString', dateIntegerToString);
    database.function('userFn_timeIntegerToString', timeIntegerToString);
    const rows = database.prepare(sql).all(sqlParameters);
    database.release();
    return rows;
}
