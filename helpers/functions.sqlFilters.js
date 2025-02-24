import { dateToInteger } from '@cityssm/utils-datetime';
export function getLotNameWhereClause(lotName = '', lotNameSearchType = '', lotsTableAlias = 'l') {
    let sqlWhereClause = '';
    const sqlParameters = [];
    if (lotName !== '') {
        switch (lotNameSearchType ?? '') {
            case 'startsWith': {
                sqlWhereClause += ` and ${lotsTableAlias}.lotName like ? || '%'`;
                sqlParameters.push(lotName);
                break;
            }
            case 'endsWith': {
                sqlWhereClause += ` and ${lotsTableAlias}.lotName like '%' || ?`;
                sqlParameters.push(lotName);
                break;
            }
            default: {
                const usedPieces = new Set();
                const lotNamePieces = lotName.toLowerCase().split(' ');
                for (const lotNamePiece of lotNamePieces) {
                    if (lotNamePiece === '' || usedPieces.has(lotNamePiece)) {
                        continue;
                    }
                    usedPieces.add(lotNamePiece);
                    sqlWhereClause += ` and instr(lower(${lotsTableAlias}.lotName), ?)`;
                    sqlParameters.push(lotNamePiece);
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
