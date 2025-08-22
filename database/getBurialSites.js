import { dateToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sanitizeLimit, sanitizeOffset, sunriseDB } from '../helpers/database.helpers.js';
import { getBurialSiteNameWhereClause } from '../helpers/functions.sqlFilters.js';
export default function getBurialSites(filters, options, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    const { sqlParameters, sqlWhereClause } = buildWhereClause(filters, options.includeDeleted ?? false);
    const currentDate = dateToInteger(new Date());
    let count = 0;
    const isLimited = options.limit !== -1;
    if (isLimited) {
        count = database
            .prepare(`select count(*) as recordCount
          from BurialSites l
          left join Cemeteries c on l.cemeteryId = c.cemeteryId
          left join (
            select burialSiteId, count(contractId) as contractCount from Contracts
            where recordDelete_timeMillis is null
            and contractStartDate <= ${currentDate.toString()}
            and (contractEndDate is null or contractEndDate >= ${currentDate.toString()})
            group by burialSiteId
          ) o on l.burialSiteId = o.burialSiteId
          ${sqlWhereClause}`)
            .pluck()
            .get(sqlParameters);
    }
    let burialSites = [];
    if (!isLimited || count > 0) {
        const includeContractCount = options.includeContractCount ?? true;
        if (includeContractCount) {
            sqlParameters.unshift(currentDate, currentDate);
        }
        const sqlLimitClause = isLimited
            ? ` limit ${sanitizeLimit(options.limit)}
          offset ${sanitizeOffset(options.offset)}`
            : '';
        burialSites = database
            .prepare(`select l.burialSiteId,
          l.burialSiteNameSegment1,
          l.burialSiteNameSegment2,
          l.burialSiteNameSegment3,
          l.burialSiteNameSegment4,
          l.burialSiteNameSegment5,
          l.burialSiteName,
          t.burialSiteType,
          l.bodyCapacity, l.crematedCapacity,
          l.cemeteryId, c.cemeteryName, l.cemeterySvgId,
          l.burialSiteStatusId, s.burialSiteStatus
          ${includeContractCount
            ? ', ifnull(o.contractCount, 0) as contractCount'
            : ''}
          from BurialSites l
          left join BurialSiteTypes t on l.burialSiteTypeId = t.burialSiteTypeId
          left join BurialSiteStatuses s on l.burialSiteStatusId = s.burialSiteStatusId
          left join Cemeteries c on l.cemeteryId = c.cemeteryId
          ${includeContractCount
            ? `left join (
                  select burialSiteId, count(contractId) as contractCount
                  from Contracts
                  where recordDelete_timeMillis is null
                  and contractStartDate <= ?
                  and (contractEndDate is null or contractEndDate >= ?)
                  group by burialSiteId) o on l.burialSiteId = o.burialSiteId`
            : ''}
          ${sqlWhereClause}
          order by l.burialSiteName,
            l.burialSiteId
          ${sqlLimitClause}`)
            .all(sqlParameters);
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
function buildWhereClause(filters, includeDeleted) {
    let sqlWhereClause = ` where ${includeDeleted ? ' 1 = 1' : ' l.recordDelete_timeMillis is null'}`;
    const sqlParameters = [];
    const burialSiteNameFilters = getBurialSiteNameWhereClause(filters.burialSiteName, filters.burialSiteNameSearchType ?? '', 'l');
    sqlWhereClause += burialSiteNameFilters.sqlWhereClause;
    sqlParameters.push(...burialSiteNameFilters.sqlParameters);
    if ((filters.cemeteryId ?? '') !== '') {
        sqlWhereClause += ' and (c.cemeteryId = ? or c.parentCemeteryId = ?)';
        sqlParameters.push(filters.cemeteryId, filters.cemeteryId);
    }
    if ((filters.burialSiteTypeId ?? '') !== '') {
        sqlWhereClause += ' and l.burialSiteTypeId = ?';
        sqlParameters.push(filters.burialSiteTypeId);
    }
    if ((filters.burialSiteStatusId ?? '') !== '') {
        sqlWhereClause += ' and l.burialSiteStatusId = ?';
        sqlParameters.push(filters.burialSiteStatusId);
    }
    if ((filters.contractStatus ?? '') !== '') {
        if (filters.contractStatus === 'occupied') {
            sqlWhereClause += ' and contractCount > 0';
        }
        else if (filters.contractStatus === 'unoccupied') {
            sqlWhereClause += ' and (contractCount is null or contractCount = 0)';
        }
    }
    if ((filters.workOrderId ?? '') !== '') {
        sqlWhereClause +=
            ' and l.burialSiteId in (select burialSiteId from WorkOrderBurialSites where recordDelete_timeMillis is null and workOrderId = ?)';
        sqlParameters.push(filters.workOrderId);
    }
    return {
        sqlParameters,
        sqlWhereClause
    };
}
