import { dateToInteger } from '@cityssm/utils-datetime';
import { getDatabaseConnection, sanitizeLimit, sanitizeOffset } from '../helpers/database.helpers.js';
import { getBurialSiteNameWhereClause } from '../helpers/functions.sqlFilters.js';
export default function getBurialSites(filters, options, connectedDatabase) {
    const database = connectedDatabase ?? getDatabaseConnection();
    const { sqlParameters, sqlWhereClause } = buildWhereClause(filters, options.shouldIncludeDeletedRecords ?? false);
    const currentDate = dateToInteger(new Date());
    let count = 0;
    const isLimited = options.limit !== -1;
    if (isLimited) {
        const countResult = database
            .prepare(`
        SELECT
          COUNT(*) AS recordCount
        FROM
          BurialSites b
          LEFT JOIN Cemeteries cem ON b.cemeteryId = cem.cemeteryId
          LEFT JOIN (
            SELECT
              burialSiteId,
              COUNT(contractId) AS contractCount
            FROM
              Contracts
            WHERE
              recordDelete_timeMillis IS NULL
              AND contractStartDate <= ${currentDate.toString()}
              AND (
                contractEndDate IS NULL
                OR contractEndDate >= ${currentDate.toString()}
              )
            GROUP BY
              burialSiteId
          ) c ON b.burialSiteId = c.burialSiteId
          ${sqlWhereClause}
      `)
            .get(...sqlParameters);
        count = countResult?.recordCount ?? 0;
    }
    let burialSites = [];
    if (!isLimited || count > 0) {
        const shouldIncludeContractCount = options.includeContractCount ?? true;
        if (shouldIncludeContractCount) {
            sqlParameters.unshift(currentDate, currentDate);
        }
        const sqlLimitClause = isLimited
            ? ` limit ${sanitizeLimit(options.limit)}
          offset ${sanitizeOffset(options.offset)}`
            : '';
        burialSites = database
            .prepare(`
        SELECT
          b.burialSiteId,
          b.burialSiteNameSegment1,
          b.burialSiteNameSegment2,
          b.burialSiteNameSegment3,
          b.burialSiteNameSegment4,
          b.burialSiteNameSegment5,
          b.burialSiteName,
          t.burialSiteType,
          b.bodyCapacity,
          b.crematedCapacity,
          t.bodyCapacityMax,
          t.crematedCapacityMax,
          IFNULL(u.bodyCapacityUsed, 0) AS bodyCapacityUsed,
          IFNULL(u.crematedCapacityUsed, 0) AS crematedCapacityUsed,
          b.cemeteryId,
          cem.cemeteryName,
          b.cemeterySvgId,
          b.burialSiteStatusId,
          s.burialSiteStatus,
          b.burialSiteLatitude,
          b.burialSiteLongitude
          ${shouldIncludeContractCount
            ? ', IFNULL(c.contractCount, 0) as contractCount'
            : ''}
        FROM
          BurialSites b
          LEFT JOIN BurialSiteTypes t ON b.burialSiteTypeId = t.burialSiteTypeId
          LEFT JOIN BurialSiteStatuses s ON b.burialSiteStatusId = s.burialSiteStatusId
          LEFT JOIN Cemeteries cem ON b.cemeteryId = cem.cemeteryId
          LEFT JOIN (
            SELECT
              c.burialSiteId,
              SUM(
                CASE
                  WHEN ict.isCremationType = 1 THEN 1
                  ELSE 0
                END
              ) AS crematedCapacityUsed,
              SUM(
                CASE
                  WHEN ci.intermentContainerTypeId IS NULL
                  OR ict.isCremationType = 0 THEN 1
                  ELSE 0
                END
              ) AS bodyCapacityUsed
            FROM
              Contracts c
              LEFT JOIN ContractTypes ct ON c.contractTypeId = ct.contractTypeId
              LEFT JOIN ContractInterments ci ON c.contractId = ci.contractId
              LEFT JOIN IntermentContainerTypes ict ON ci.intermentContainerTypeId = ict.intermentContainerTypeId
            WHERE
              c.recordDelete_timeMillis IS NULL
              AND ci.recordDelete_timeMillis IS NULL
              AND ct.isPreneed = 0
              AND c.contractStartDate <= ${currentDate.toString()}
              AND (
                c.contractEndDate IS NULL
                OR c.contractEndDate >= ${currentDate.toString()}
              )
            GROUP BY
              c.burialSiteId
          ) u ON b.burialSiteId = u.burialSiteId
          ${shouldIncludeContractCount
            ? `
                LEFT JOIN (
                  SELECT
                    burialSiteId,
                    COUNT(contractId) AS contractCount
                  FROM
                    Contracts
                  WHERE
                    recordDelete_timeMillis IS NULL
                    AND contractStartDate <= ?
                    AND (
                      contractEndDate IS NULL
                      OR contractEndDate >= ?
                    )
                  GROUP BY
                    burialSiteId
                ) c ON b.burialSiteId = c.burialSiteId
              `
            : ''}
          ${sqlWhereClause}
        ORDER BY
          b.burialSiteName,
          b.burialSiteId
          ${sqlLimitClause}
      `)
            .all(...sqlParameters);
        if (options.limit === -1) {
            count = burialSites.length;
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return {
        burialSites,
        count
    };
}
function buildWhereClause(filters, shouldIncludeDeleted) {
    let sqlWhereClause = ` WHERE ${shouldIncludeDeleted ? ' 1 = 1' : ' b.recordDelete_timeMillis IS NULL'}`;
    const sqlParameters = [];
    const burialSiteNameFilters = getBurialSiteNameWhereClause(filters.burialSiteName, filters.burialSiteNameSearchType ?? '', 'b');
    sqlWhereClause += burialSiteNameFilters.sqlWhereClause;
    sqlParameters.push(...burialSiteNameFilters.sqlParameters);
    if (filters.cemeteryId !== undefined && (filters.cemeteryId ?? '') !== '') {
        sqlWhereClause += ' AND (cem.cemeteryId = ? OR cem.parentCemeteryId = ?)';
        sqlParameters.push(filters.cemeteryId, filters.cemeteryId);
    }
    if (filters.burialSiteTypeId !== undefined &&
        (filters.burialSiteTypeId ?? '') !== '') {
        sqlWhereClause += ' AND b.burialSiteTypeId = ?';
        sqlParameters.push(filters.burialSiteTypeId);
    }
    if (filters.burialSiteStatusId !== undefined &&
        (filters.burialSiteStatusId ?? '') !== '') {
        sqlWhereClause += ' AND b.burialSiteStatusId = ?';
        sqlParameters.push(filters.burialSiteStatusId);
    }
    if ((filters.contractStatus ?? '') !== '') {
        if (filters.contractStatus === 'occupied') {
            sqlWhereClause += ' AND contractCount > 0';
        }
        else if (filters.contractStatus === 'unoccupied') {
            sqlWhereClause += ' AND (contractCount IS NULL or contractCount = 0)';
        }
    }
    if (filters.workOrderId !== undefined && (filters.workOrderId ?? '') !== '') {
        sqlWhereClause += `
      AND b.burialSiteId IN (
        SELECT
          burialSiteId
        FROM
          WorkOrderBurialSites
        WHERE
          recordDelete_timeMillis IS NULL
          AND workOrderId = ?
      )
    `;
        sqlParameters.push(filters.workOrderId);
    }
    if ((filters.hasCoordinates ?? '') === 'yes') {
        sqlWhereClause +=
            ' AND (b.burialSiteLatitude IS NOT NULL AND b.burialSiteLongitude IS NOT NULL)';
    }
    if ((filters.hasCoordinates ?? '') === 'no') {
        sqlWhereClause +=
            ' AND (b.burialSiteLatitude IS NULL OR b.burialSiteLongitude IS NULL)';
    }
    return {
        sqlParameters,
        sqlWhereClause
    };
}
