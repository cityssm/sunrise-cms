import { dateIntegerToString, dateStringToInteger, dateToInteger, timeIntegerToPeriodString, timeIntegerToString } from '@cityssm/utils-datetime';
import { getDatabaseConnection, sanitizeLimit, sanitizeOffset } from '../helpers/database.helpers.js';
import { getBurialSiteNameWhereClause, getDeceasedNameWhereClause } from '../helpers/functions.sqlFilters.js';
import getContractInterments from './getContractInterments.js';
import getWorkOrderComments from './getWorkOrderComments.js';
import getWorkOrderMilestones from './getWorkOrderMilestones.js';
export default async function getWorkOrders(filters, options, connectedDatabase) {
    const database = connectedDatabase ?? getDatabaseConnection(true);
    database.function('userFn_dateIntegerToString', {
        deterministic: true
    }, (dateInteger) => dateIntegerToString(dateInteger));
    const { sqlParameters, sqlWhereClause } = buildWhereClause(filters);
    const countResult = database
        .prepare(`
      SELECT
        COUNT(*) AS recordCount
      FROM
        WorkOrders w
        ${sqlWhereClause}
    `)
        .get(...sqlParameters);
    const count = countResult.recordCount;
    let workOrders = [];
    if (count > 0) {
        const sqlLimitClause = options.limit === -1
            ? ''
            : `
            LIMIT
              ${sanitizeLimit(options.limit)}
            OFFSET
              ${sanitizeOffset(options.offset)}
          `;
        const currentDateNumber = dateToInteger(new Date());
        workOrders = database
            .prepare(`
        SELECT
          w.workOrderId,
          w.workOrderTypeId,
          t.workOrderType,
          w.workOrderNumber,
          w.workOrderDescription,
          w.workOrderOpenDate,
          userFn_dateIntegerToString (w.workOrderOpenDate) AS workOrderOpenDateString,
          w.workOrderCloseDate,
          userFn_dateIntegerToString (w.workOrderCloseDate) AS workOrderCloseDateString,
          w.workOrderStatusId,
          s.workOrderStatus,
          IFNULL(m.workOrderMilestoneCount, 0) AS workOrderMilestoneCount,
          IFNULL(m.workOrderMilestoneCompletionCount, 0) AS workOrderMilestoneCompletionCount,
          IFNULL(m.workOrderMilestoneOverdueCount, 0) AS workOrderMilestoneOverdueCount,
          IFNULL(l.workOrderBurialSiteCount, 0) AS workOrderBurialSiteCount
        FROM
          WorkOrders w
          LEFT JOIN WorkOrderTypes t ON w.workOrderTypeId = t.workOrderTypeId
          LEFT JOIN WorkOrderStatuses s ON w.workOrderStatusId = s.workOrderStatusId
          LEFT JOIN (
            SELECT
              workOrderId,
              COUNT(workOrderMilestoneId) AS workOrderMilestoneCount,
              SUM(
                CASE
                  WHEN workOrderMilestoneCompletionDate IS NULL THEN 0
                  ELSE 1
                END
              ) AS workOrderMilestoneCompletionCount,
              SUM(
                CASE
                  WHEN workOrderMilestoneDate < ${currentDateNumber}
                  AND workOrderMilestoneCompletionDate IS NULL THEN 1
                  ELSE 0
                END
              ) AS workOrderMilestoneOverdueCount
            FROM
              WorkOrderMilestones
            WHERE
              recordDelete_timeMillis IS NULL
            GROUP BY
              workOrderId
          ) m ON w.workOrderId = m.workOrderId
          LEFT JOIN (
            SELECT
              workOrderId,
              COUNT(burialSiteId) AS workOrderBurialSiteCount
            FROM
              WorkOrderBurialSites
            WHERE
              recordDelete_timeMillis IS NULL
            GROUP BY
              workOrderId
          ) l ON w.workOrderId = l.workOrderId
          ${sqlWhereClause}
        ORDER BY
          w.workOrderOpenDate DESC,
          w.workOrderNumber DESC
          ${sqlLimitClause}
      `)
            .all(...sqlParameters);
    }
    const hasInclusions = (options.includeComments ?? false) ||
        (options.includeBurialSites ?? false) ||
        (options.includeMilestones ?? false);
    if (hasInclusions) {
        await addInclusions(workOrders, options, database);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return {
        count,
        workOrders
    };
}
async function addInclusions(workOrders, options, database) {
    if (workOrders.length === 0) {
        return;
    }
    const workOrderIds = workOrders.map((workOrder) => workOrder.workOrderId);
    for (const workOrder of workOrders) {
        if (options.includeComments ?? false) {
            workOrder.workOrderComments = getWorkOrderComments(workOrder.workOrderId, database);
        }
    }
    if (options.includeMilestones ?? false) {
        await Promise.all(workOrders.map(async (workOrder) => {
            workOrder.workOrderMilestones =
                workOrder.workOrderMilestoneCount === 0
                    ? []
                    : await getWorkOrderMilestones({
                        workOrderId: workOrder.workOrderId
                    }, {
                        orderBy: 'date'
                    }, database);
        }));
    }
    if (options.includeBurialSites ?? false) {
        const placeholders = workOrderIds.map(() => '?').join(', ');
        const burialSites = database
            .prepare(`
        SELECT
          wbs.workOrderId,
          b.burialSiteId,
          b.burialSiteName,
          b.cemeteryId,
          cem.cemeteryName
        FROM
          WorkOrderBurialSites wbs
          INNER JOIN BurialSites b ON wbs.burialSiteId = b.burialSiteId
          LEFT JOIN Cemeteries cem ON b.cemeteryId = cem.cemeteryId
        WHERE
          wbs.workOrderId IN (${placeholders})
          AND wbs.recordDelete_timeMillis IS NULL
          AND b.recordDelete_timeMillis IS NULL
        ORDER BY
          b.burialSiteName,
          b.burialSiteId
      `)
            .all(...workOrderIds);
        for (const workOrder of workOrders) {
            workOrder.workOrderBurialSites = burialSites
                .filter((burialSite) => burialSite.workOrderId === workOrder.workOrderId)
                .map(({ workOrderId: _workOrderId, ...burialSite }) => burialSite);
        }
        const contracts = database
            .prepare(`
        SELECT
          wc.workOrderId,
          c.contractId,
          c.contractNumber,
          c.contractTypeId,
          ct.contractType,
          c.burialSiteId,
          b.burialSiteName,
          cem.cemeteryName,
          c.contractStartDate,
          c.contractEndDate,
          c.purchaserName,
          c.funeralHomeId,
          c.funeralDirectorName,
          c.funeralDate,
          c.funeralTime,
          c.directionOfArrival,
          c.committalTypeId,
          cm.committalType,
          f.funeralHomeName
        FROM
          WorkOrderContracts wc
          INNER JOIN Contracts c ON wc.contractId = c.contractId
          LEFT JOIN ContractTypes ct ON c.contractTypeId = ct.contractTypeId
          LEFT JOIN BurialSites b ON c.burialSiteId = b.burialSiteId
          LEFT JOIN Cemeteries cem ON b.cemeteryId = cem.cemeteryId
          LEFT JOIN CommittalTypes cm ON c.committalTypeId = cm.committalTypeId
          LEFT JOIN FuneralHomes f ON c.funeralHomeId = f.funeralHomeId
        WHERE
          wc.workOrderId IN (${placeholders})
          AND wc.recordDelete_timeMillis IS NULL
          AND c.recordDelete_timeMillis IS NULL
        ORDER BY
          c.contractStartDate DESC,
          c.contractId DESC
      `)
            .all(...workOrderIds);
        const contractIds = [
            ...new Set(contracts.map((contract) => contract.contractId))
        ];
        const interments = contractIds.length === 0
            ? []
            : getContractInterments(contractIds, database);
        for (const workOrder of workOrders) {
            workOrder.workOrderContracts = contracts
                .filter((contract) => contract.workOrderId === workOrder.workOrderId)
                .map(({ workOrderId: _workOrderId, ...contract }) => {
                contract.contractStartDateString = dateIntegerToString(contract.contractStartDate);
                contract.contractEndDateString = dateIntegerToString(contract.contractEndDate ?? 0);
                contract.funeralDateString = dateIntegerToString(contract.funeralDate ?? 0);
                contract.funeralTimeString = timeIntegerToString(contract.funeralTime);
                contract.funeralTimePeriodString = timeIntegerToPeriodString(contract.funeralTime);
                contract.contractInterments = interments.filter((interment) => interment.contractId === contract.contractId);
                return contract;
            });
        }
    }
}
function buildWhereClause(filters) {
    let sqlWhereClause = ' where w.recordDelete_timeMillis IS NULL';
    const sqlParameters = [];
    if ((filters.workOrderTypeId ?? '') !== '') {
        sqlWhereClause += ' and w.workOrderTypeId = ?';
        sqlParameters.push(filters.workOrderTypeId ?? '');
    }
    if ((filters.workOrderStatusId ?? '') !== '') {
        sqlWhereClause += ' and w.workOrderStatusId = ?';
        sqlParameters.push(filters.workOrderStatusId ?? '');
    }
    if ((filters.workOrderOpenStatus ?? '') !== '') {
        if (filters.workOrderOpenStatus === 'open') {
            sqlWhereClause += ' and w.workOrderCloseDate IS NULL';
        }
        else if (filters.workOrderOpenStatus === 'closed') {
            sqlWhereClause += ' and w.workOrderCloseDate IS NOT NULL';
        }
    }
    if ((filters.workOrderOpenDateString ?? '') !== '') {
        sqlWhereClause += ' and w.workOrderOpenDate = ?';
        sqlParameters.push(dateStringToInteger(filters.workOrderOpenDateString));
    }
    if ((filters.workOrderMilestoneDateString ?? '') !== '') {
        sqlWhereClause += `
      AND (
        w.workOrderId IN (
          SELECT
            workOrderId
          FROM
            WorkOrderMilestones
          WHERE
            recordDelete_timeMillis IS NULL
            AND workOrderMilestoneDate = ?
        )
        OR (
          w.workOrderOpenDate = ?
          AND (
            SELECT
              COUNT(*)
            FROM
              WorkOrderMilestones m
            WHERE
              m.recordDelete_timeMillis IS NULL
              AND m.workOrderId = w.workOrderId
          ) = 0
        )
      )
    `;
        sqlParameters.push(dateStringToInteger(filters.workOrderMilestoneDateString), dateStringToInteger(filters.workOrderMilestoneDateString));
    }
    if ((filters.funeralHomeId ?? '') !== '') {
        sqlWhereClause += `
      AND w.workOrderId IN (
        SELECT
          workOrderId
        FROM
          WorkOrderContracts wc
          LEFT JOIN Contracts c ON wc.contractId = c.contractId
        WHERE
          wc.recordDelete_timeMillis IS NULL
          AND c.funeralHomeId = ?
      )
    `;
        sqlParameters.push(filters.funeralHomeId ?? '');
    }
    const deceasedNameFilters = getDeceasedNameWhereClause(filters.deceasedName, 'ci');
    if (deceasedNameFilters.sqlParameters.length > 0) {
        sqlWhereClause += `
      AND w.workOrderId IN (
        SELECT
          workOrderId
        FROM
          WorkOrderContracts wc
        WHERE
          wc.recordDelete_timeMillis IS NULL
          AND wc.contractId IN (
            SELECT
              contractId
            FROM
              ContractInterments ci
            WHERE
              ci.recordDelete_timeMillis IS NULL
              ${deceasedNameFilters.sqlWhereClause}
          )
      )
    `;
        sqlParameters.push(...deceasedNameFilters.sqlParameters);
    }
    const burialSiteNameFilters = getBurialSiteNameWhereClause(filters.burialSiteName, '', 'l');
    if (burialSiteNameFilters.sqlParameters.length > 0) {
        sqlWhereClause += `
      AND (
        w.workOrderId IN (
          SELECT
            workOrderId
          FROM
            WorkOrderBurialSites
          WHERE
            recordDelete_timeMillis IS NULL
            AND burialSiteId IN (
              SELECT
                burialSiteId
              FROM
                BurialSites l
              WHERE
                recordDelete_timeMillis IS NULL
                ${burialSiteNameFilters.sqlWhereClause}
            )
        )
        OR w.workOrderId IN (
          SELECT
            workOrderId
          FROM
            WorkOrderContracts wc
            LEFT JOIN Contracts c ON wc.contractId = c.contractId
          WHERE
            wc.recordDelete_timeMillis IS NULL
            AND c.burialSiteId IN (
              SELECT
                burialSiteId
              FROM
                BurialSites l
              WHERE
                l.recordDelete_timeMillis IS NULL
                ${burialSiteNameFilters.sqlWhereClause}
            )
        )
      )
    `;
        sqlParameters.push(...burialSiteNameFilters.sqlParameters, ...burialSiteNameFilters.sqlParameters);
    }
    if ((filters.cemeteryId ?? '') !== '') {
        sqlWhereClause += `
      AND (
        w.workOrderId IN (
          SELECT
            workOrderId
          FROM
            WorkOrderBurialSites wb
            LEFT JOIN BurialSites b ON wb.burialSiteId = b.burialSiteId
            LEFT JOIN Cemeteries cem ON b.cemeteryId = cem.cemeteryId
          WHERE
            wb.recordDelete_timeMillis IS NULL
            AND (
              cem.cemeteryId = ?
              OR cem.parentCemeteryId = ?
            )
        )
        OR w.workOrderId IN (
          SELECT
            workOrderId
          FROM
            WorkOrderContracts wc
            LEFT JOIN Contracts c ON wc.contractId = c.contractId
            LEFT JOIN BurialSites b ON c.burialSiteId = b.burialSiteId
            LEFT JOIN Cemeteries cem ON b.cemeteryId = cem.cemeteryId
          WHERE
            wc.recordDelete_timeMillis IS NULL
            AND (
              cem.cemeteryId = ?
              OR cem.parentCemeteryId = ?
            )
        )
      )
    `;
        sqlParameters.push(filters.cemeteryId ?? '', filters.cemeteryId ?? '', filters.cemeteryId ?? '', filters.cemeteryId ?? '');
    }
    if (filters.contractId !== undefined && (filters.contractId ?? '') !== '') {
        sqlWhereClause += `
      AND w.workOrderId IN (
        SELECT
          workOrderId
        FROM
          WorkOrderContracts
        WHERE
          recordDelete_timeMillis IS NULL
          AND contractId = ?
      )
    `;
        sqlParameters.push(filters.contractId);
    }
    return {
        sqlParameters,
        sqlWhereClause
    };
}
