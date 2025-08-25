"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getBurialSites;
var utils_datetime_1 = require("@cityssm/utils-datetime");
var better_sqlite3_1 = require("better-sqlite3");
var database_helpers_js_1 = require("../helpers/database.helpers.js");
var functions_sqlFilters_js_1 = require("../helpers/functions.sqlFilters.js");
function getBurialSites(filters, options, connectedDatabase) {
    var _a, _b;
    var database = connectedDatabase !== null && connectedDatabase !== void 0 ? connectedDatabase : (0, better_sqlite3_1.default)(database_helpers_js_1.sunriseDB, { readonly: true });
    var _c = buildWhereClause(filters, (_a = options.includeDeleted) !== null && _a !== void 0 ? _a : false), sqlParameters = _c.sqlParameters, sqlWhereClause = _c.sqlWhereClause;
    var currentDate = (0, utils_datetime_1.dateToInteger)(new Date());
    var count = 0;
    var isLimited = options.limit !== -1;
    if (isLimited) {
        count = database
            .prepare("select count(*) as recordCount\n          from BurialSites b\n          left join Cemeteries c on b.cemeteryId = c.cemeteryId\n          left join (\n            select burialSiteId, count(contractId) as contractCount from Contracts\n            where recordDelete_timeMillis is null\n            and contractStartDate <= ".concat(currentDate.toString(), "\n            and (contractEndDate is null or contractEndDate >= ").concat(currentDate.toString(), ")\n            group by burialSiteId\n          ) o on b.burialSiteId = o.burialSiteId\n          ").concat(sqlWhereClause))
            .pluck()
            .get(sqlParameters);
    }
    var burialSites = [];
    if (!isLimited || count > 0) {
        var includeContractCount = (_b = options.includeContractCount) !== null && _b !== void 0 ? _b : true;
        if (includeContractCount) {
            sqlParameters.unshift(currentDate, currentDate);
        }
        var sqlLimitClause = isLimited
            ? " limit ".concat((0, database_helpers_js_1.sanitizeLimit)(options.limit), "\n          offset ").concat((0, database_helpers_js_1.sanitizeOffset)(options.offset))
            : '';
        burialSites = database
            .prepare("select b.burialSiteId,\n          b.burialSiteNameSegment1,\n          b.burialSiteNameSegment2,\n          b.burialSiteNameSegment3,\n          b.burialSiteNameSegment4,\n          b.burialSiteNameSegment5,\n          b.burialSiteName,\n          t.burialSiteType,\n          b.bodyCapacity, b.crematedCapacity,\n          b.cemeteryId, c.cemeteryName, b.cemeterySvgId,\n          b.burialSiteStatusId, s.burialSiteStatus\n          ".concat(includeContractCount
            ? ', ifnull(o.contractCount, 0) as contractCount'
            : '', "\n          from BurialSites b\n          left join BurialSiteTypes t on b.burialSiteTypeId = t.burialSiteTypeId\n          left join BurialSiteStatuses s on b.burialSiteStatusId = s.burialSiteStatusId\n          left join Cemeteries c on b.cemeteryId = c.cemeteryId\n          ").concat(includeContractCount
            ? "left join (\n                  select burialSiteId, count(contractId) as contractCount\n                  from Contracts\n                  where recordDelete_timeMillis is null\n                  and contractStartDate <= ?\n                  and (contractEndDate is null or contractEndDate >= ?)\n                  group by burialSiteId) o on b.burialSiteId = o.burialSiteId"
            : '', "\n          ").concat(sqlWhereClause, "\n          order by b.burialSiteName,\n            b.burialSiteId\n          ").concat(sqlLimitClause))
            .all(sqlParameters);
        if (options.limit === -1) {
            count = burialSites.length;
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return {
        burialSites: burialSites,
        count: count
    };
}
function buildWhereClause(filters, includeDeleted) {
    var _a, _b, _c, _d, _e, _f;
    var sqlWhereClause = " where ".concat(includeDeleted ? ' 1 = 1' : ' b.recordDelete_timeMillis is null');
    var sqlParameters = [];
    var burialSiteNameFilters = (0, functions_sqlFilters_js_1.getBurialSiteNameWhereClause)(filters.burialSiteName, (_a = filters.burialSiteNameSearchType) !== null && _a !== void 0 ? _a : '', 'b');
    sqlWhereClause += burialSiteNameFilters.sqlWhereClause;
    sqlParameters.push.apply(sqlParameters, burialSiteNameFilters.sqlParameters);
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
    return {
        sqlParameters: sqlParameters,
        sqlWhereClause: sqlWhereClause
    };
}
