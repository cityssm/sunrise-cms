"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBurialSiteNameWhereClause = getBurialSiteNameWhereClause;
exports.getContractTimeWhereClause = getContractTimeWhereClause;
exports.getDeceasedNameWhereClause = getDeceasedNameWhereClause;
var utils_datetime_1 = require("@cityssm/utils-datetime");
function getBurialSiteNameWhereClause(burialSiteName, burialSiteNameSearchType, burialSitesTableAlias) {
    if (burialSiteName === void 0) { burialSiteName = ''; }
    if (burialSiteNameSearchType === void 0) { burialSiteNameSearchType = ''; }
    if (burialSitesTableAlias === void 0) { burialSitesTableAlias = 'l'; }
    var sqlWhereClause = '';
    var sqlParameters = [];
    if (burialSiteName !== '') {
        switch (burialSiteNameSearchType) {
            case 'endsWith': {
                sqlWhereClause += " and ".concat(burialSitesTableAlias, ".burialSiteName like '%' || ?");
                sqlParameters.push(burialSiteName);
                break;
            }
            case 'startsWith': {
                sqlWhereClause += " and ".concat(burialSitesTableAlias, ".burialSiteName like ? || '%'");
                sqlParameters.push(burialSiteName);
                break;
            }
            default: {
                var usedPieces = new Set();
                var burialSiteNamePieces = burialSiteName.toLowerCase().split(' ');
                for (var _i = 0, burialSiteNamePieces_1 = burialSiteNamePieces; _i < burialSiteNamePieces_1.length; _i++) {
                    var burialSiteNamePiece = burialSiteNamePieces_1[_i];
                    if (burialSiteNamePiece === '' || usedPieces.has(burialSiteNamePiece)) {
                        continue;
                    }
                    usedPieces.add(burialSiteNamePiece);
                    sqlWhereClause += " and instr(lower(".concat(burialSitesTableAlias, ".burialSiteName), ?)");
                    sqlParameters.push(burialSiteNamePiece);
                }
            }
        }
    }
    return {
        sqlParameters: sqlParameters,
        sqlWhereClause: sqlWhereClause
    };
}
function getContractTimeWhereClause(contractTime, contractsTableAlias) {
    if (contractsTableAlias === void 0) { contractsTableAlias = 'o'; }
    var sqlWhereClause = '';
    var sqlParameters = [];
    var currentDateString = (0, utils_datetime_1.dateToInteger)(new Date());
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (contractTime !== null && contractTime !== void 0 ? contractTime : '') {
        case 'current': {
            sqlWhereClause += " and ".concat(contractsTableAlias, ".contractStartDate <= ?\n        and (").concat(contractsTableAlias, ".contractEndDate is null or ").concat(contractsTableAlias, ".contractEndDate >= ?)");
            sqlParameters.push(currentDateString, currentDateString);
            break;
        }
        case 'future': {
            sqlWhereClause +=
                " and ".concat(contractsTableAlias, ".contractStartDate > ?");
            sqlParameters.push(currentDateString);
            break;
        }
        case 'past': {
            sqlWhereClause +=
                " and ".concat(contractsTableAlias, ".contractEndDate < ?");
            sqlParameters.push(currentDateString);
            break;
        }
    }
    return {
        sqlParameters: sqlParameters,
        sqlWhereClause: sqlWhereClause
    };
}
function getDeceasedNameWhereClause(deceasedName, tableAlias) {
    if (deceasedName === void 0) { deceasedName = ''; }
    if (tableAlias === void 0) { tableAlias = 'o'; }
    var sqlWhereClause = '';
    var sqlParameters = [];
    var usedPieces = new Set();
    var deceasedNamePieces = deceasedName.toLowerCase().split(' ');
    for (var _i = 0, deceasedNamePieces_1 = deceasedNamePieces; _i < deceasedNamePieces_1.length; _i++) {
        var namePiece = deceasedNamePieces_1[_i];
        if (namePiece === '' || usedPieces.has(namePiece)) {
            continue;
        }
        usedPieces.add(namePiece);
        sqlWhereClause += " and instr(lower(".concat(tableAlias, ".deceasedName), ?)");
        sqlParameters.push(namePiece);
    }
    return {
        sqlParameters: sqlParameters,
        sqlWhereClause: sqlWhereClause
    };
}
