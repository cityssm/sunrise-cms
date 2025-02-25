import { dateToInteger } from '@cityssm/utils-datetime';
export function getBurialSiteNameWhereClause(burialSiteName = '', burialSiteNameSearchType = '', burialSitesTableAlias = 'l') {
    let sqlWhereClause = '';
    const sqlParameters = [];
    if (burialSiteName !== '') {
        switch (burialSiteNameSearchType) {
            case 'startsWith': {
                sqlWhereClause += ` and ${burialSitesTableAlias}.burialSiteName like ? || '%'`;
                sqlParameters.push(burialSiteName);
                break;
            }
            case 'endsWith': {
                sqlWhereClause += ` and ${burialSitesTableAlias}.burialSiteName like '%' || ?`;
                sqlParameters.push(burialSiteName);
                break;
            }
            default: {
                const usedPieces = new Set();
                const burialSiteNamePieces = burialSiteName.toLowerCase().split(' ');
                for (const burialSiteNamePiece of burialSiteNamePieces) {
                    if (burialSiteNamePiece === '' || usedPieces.has(burialSiteNamePiece)) {
                        continue;
                    }
                    usedPieces.add(burialSiteNamePiece);
                    sqlWhereClause += ` and instr(lower(${burialSitesTableAlias}.burialSiteName), ?)`;
                    sqlParameters.push(burialSiteNamePiece);
                }
            }
        }
    }
    return {
        sqlWhereClause,
        sqlParameters
    };
}
export function getOccupancyTimeWhereClause(occupancyTime, lotOccupanciesTableAlias = 'o') {
    let sqlWhereClause = '';
    const sqlParameters = [];
    const currentDateString = dateToInteger(new Date());
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (occupancyTime ?? '') {
        case 'current': {
            sqlWhereClause += ` and ${lotOccupanciesTableAlias}.contractStartDate <= ?
        and (${lotOccupanciesTableAlias}.contractEndDate is null or ${lotOccupanciesTableAlias}.contractEndDate >= ?)`;
            sqlParameters.push(currentDateString, currentDateString);
            break;
        }
        case 'past': {
            sqlWhereClause +=
                ` and ${lotOccupanciesTableAlias}.contractEndDate < ?`;
            sqlParameters.push(currentDateString);
            break;
        }
        case 'future': {
            sqlWhereClause +=
                ` and ${lotOccupanciesTableAlias}.contractStartDate > ?`;
            sqlParameters.push(currentDateString);
            break;
        }
    }
    return {
        sqlWhereClause,
        sqlParameters
    };
}
export function getOccupantNameWhereClause(occupantName = '', tableAlias = 'o') {
    let sqlWhereClause = '';
    const sqlParameters = [];
    const usedPieces = new Set();
    const occupantNamePieces = occupantName.toLowerCase().split(' ');
    for (const occupantNamePiece of occupantNamePieces) {
        if (occupantNamePiece === '' || usedPieces.has(occupantNamePiece)) {
            continue;
        }
        usedPieces.add(occupantNamePiece);
        sqlWhereClause += ` and (instr(lower(${tableAlias}.occupantName), ?) or instr(lower(${tableAlias}.occupantFamilyName), ?))`;
        sqlParameters.push(occupantNamePiece, occupantNamePiece);
    }
    return {
        sqlWhereClause,
        sqlParameters
    };
}
