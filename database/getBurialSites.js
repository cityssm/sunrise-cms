"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getBurialSites;
const utils_datetime_1 = require("@cityssm/utils-datetime");
const better_sqlite3_1 = require("better-sqlite3");
const database_helpers_js_1 = require("../helpers/database.helpers.js");
const functions_sqlFilters_js_1 = require("../helpers/functions.sqlFilters.js");
function getBurialSites(filters, options, connectedDatabase) {
    var _a, _b;
    const database = connectedDatabase !== null && connectedDatabase !== void 0 ? connectedDatabase : (0, better_sqlite3_1.default)(database_helpers_js_1.sunriseDB, { readonly: true });
    const { sqlParameters, sqlWhereClause } = buildWhereClause(filters, (_a = options.includeDeleted) !== null && _a !== void 0 ? _a : false);
    const currentDate = (0, utils_datetime_1.dateToInteger)(new Date());
    let count = 0;
    const isLimited = options.limit !== -1;
    if (isLimited) {
        count = database
            .prepare(`select count(*) as recordCount
          from BurialSites b
          left join Cemeteries c on b.cemeteryId = c.cemeteryId
          left join (
            select burialSiteId, count(contractId) as contractCount from Contracts
            where recordDelete_timeMillis is null
            and contractStartDate <= ${currentDate.toString()}
            and (contractEndDate is null or contractEndDate >= ${currentDate.toString()})
            group by burialSiteId
          ) o on b.burialSiteId = o.burialSiteId
          ${sqlWhereClause}`)
            .pluck()
            .get(sqlParameters);
    }
    let burialSites = [];
    if (!isLimited || count > 0) {
        const includeContractCount = (_b = options.includeContractCount) !== null && _b !== void 0 ? _b : true;
        if (includeContractCount) {
            sqlParameters.unshift(currentDate, currentDate);
        }
        const sqlLimitClause = isLimited
            ? ` limit ${(0, database_helpers_js_1.sanitizeLimit)(options.limit)}
          offset ${(0, database_helpers_js_1.sanitizeOffset)(options.offset)}`
            : '';
        burialSites = database
            .prepare(`select b.burialSiteId,
          b.burialSiteNameSegment1,
          b.burialSiteNameSegment2,
          b.burialSiteNameSegment3,
          b.burialSiteNameSegment4,
          b.burialSiteNameSegment5,
          b.burialSiteName,
          t.burialSiteType,
          b.bodyCapacity, b.crematedCapacity,
          b.cemeteryId, c.cemeteryName, b.cemeterySvgId,
          b.burialSiteStatusId, s.burialSiteStatus,
          b.burialSiteLatitude, b.burialSiteLongitude
          ${includeContractCount
            ? ', ifnull(o.contractCount, 0) as contractCount'
            : ''}
          from BurialSites b
          left join BurialSiteTypes t on b.burialSiteTypeId = t.burialSiteTypeId
          left join BurialSiteStatuses s on b.burialSiteStatusId = s.burialSiteStatusId
          left join Cemeteries c on b.cemeteryId = c.cemeteryId
          ${includeContractCount
            ? `left join (
                  select burialSiteId, count(contractId) as contractCount
                  from Contracts
                  where recordDelete_timeMillis is null
                  and contractStartDate <= ?
                  and (contractEndDate is null or contractEndDate >= ?)
                  group by burialSiteId) o on b.burialSiteId = o.burialSiteId`
            : ''}
          ${sqlWhereClause}
          order by b.burialSiteName,
            b.burialSiteId
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
    var _a, _b, _c, _d, _e, _f, _g, _h;
    let sqlWhereClause = ` where ${includeDeleted ? ' 1 = 1' : ' b.recordDelete_timeMillis is null'}`;
    const sqlParameters = [];
    const burialSiteNameFilters = (0, functions_sqlFilters_js_1.getBurialSiteNameWhereClause)(filters.burialSiteName, (_a = filters.burialSiteNameSearchType) !== null && _a !== void 0 ? _a : '', 'b');
    sqlWhereClause += burialSiteNameFilters.sqlWhereClause;
    sqlParameters.push(...burialSiteNameFilters.sqlParameters);
    if (((_b = filters.cemeteryId) !== null && _b !== void 0 ? _b : '') !== '') {
        sqlWhereClause += ' and (c.cemeteryId = ? or c.parentCemeteryId = ?)';
        sqlParameters.push(filters.cemeteryId, filters.cemeteryId);
    }
    if (((_c = filters.burialSiteTypeId) !== null && _c !== void 0 ? _c : '') !== '') {
        sqlWhereClause += ' and b.burialSiteTypeId = ?';
        sqlParameters.push(filters.burialSiteTypeId);
    }
    if (((_d = filters.burialSiteStatusId) !== null && _d !== void 0 ? _d : '') !== '') {
        sqlWhereClause += ' and b.burialSiteStatusId = ?';
        sqlParameters.push(filters.burialSiteStatusId);
    }
    if (((_e = filters.contractStatus) !== null && _e !== void 0 ? _e : '') !== '') {
        if (filters.contractStatus === 'occupied') {
            sqlWhereClause += ' and contractCount > 0';
        }
        else if (filters.contractStatus === 'unoccupied') {
            sqlWhereClause += ' and (contractCount is null or contractCount = 0)';
        }
    }
    if (((_f = filters.workOrderId) !== null && _f !== void 0 ? _f : '') !== '') {
        sqlWhereClause +=
            ' and b.burialSiteId in (select burialSiteId from WorkOrderBurialSites where recordDelete_timeMillis is null and workOrderId = ?)';
        sqlParameters.push(filters.workOrderId);
    }
    if (((_g = filters.hasCoordinates) !== null && _g !== void 0 ? _g : '') === 'yes') {
        sqlWhereClause += ' and (b.burialSiteLatitude is not null and b.burialSiteLongitude is not null)';
    }
    if (((_h = filters.hasCoordinates) !== null && _h !== void 0 ? _h : '') === 'no') {
        sqlWhereClause += ' and (b.burialSiteLatitude is null or b.burialSiteLongitude is null)';
    }
    return {
        sqlParameters,
        sqlWhereClause
    };
}
