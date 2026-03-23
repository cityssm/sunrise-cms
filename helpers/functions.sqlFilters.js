import { dateToInteger } from '@cityssm/utils-datetime';
export function getBurialSiteNameWhereClause(burialSiteName = '', burialSiteNameSearchType = '', burialSitesTableAlias = 'b') {
    let sqlWhereClause = '';
    const sqlParameters = [];
    if (burialSiteName !== '') {
        switch (burialSiteNameSearchType) {
            case 'endsWith': {
                sqlWhereClause += ` and ${burialSitesTableAlias}.burialSiteName like '%' || ?`;
                sqlParameters.push(burialSiteName);
                break;
            }
            case 'startsWith': {
                sqlWhereClause += ` and ${burialSitesTableAlias}.burialSiteName like ? || '%'`;
                sqlParameters.push(burialSiteName);
                break;
            }
            default: {
                const usedPieces = new Set();
                const burialSiteNamePieces = burialSiteName.toLowerCase().split(' ');
                for (const burialSiteNamePiece of burialSiteNamePieces) {
                    if (burialSiteNamePiece === '' ||
                        usedPieces.has(burialSiteNamePiece)) {
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
        sqlParameters,
        sqlWhereClause
    };
}
export function getContractTimeWhereClause(contractTime, contractsTableAlias = 'o') {
    let sqlWhereClause = '';
    const sqlParameters = [];
    const currentDateString = dateToInteger(new Date());
    switch (contractTime ?? '') {
        case 'current': {
            sqlWhereClause += ` and ${contractsTableAlias}.contractStartDate <= ?
        and (${contractsTableAlias}.contractEndDate is null or ${contractsTableAlias}.contractEndDate >= ?)`;
            sqlParameters.push(currentDateString, currentDateString);
            break;
        }
        case 'future': {
            sqlWhereClause += ` and ${contractsTableAlias}.contractStartDate > ?`;
            sqlParameters.push(currentDateString);
            break;
        }
        case 'past': {
            sqlWhereClause += ` and ${contractsTableAlias}.contractEndDate < ?`;
            sqlParameters.push(currentDateString);
            break;
        }
        default: {
            // no default
            break;
        }
    }
    return {
        sqlParameters,
        sqlWhereClause
    };
}
export function getDeceasedNameWhereClause(deceasedName = '', tableAlias = 'ci') {
    let sqlWhereClause = '';
    const sqlParameters = [];
    const usedPieces = new Set();
    const deceasedNamePieces = deceasedName.toLowerCase().split(' ');
    for (const namePiece of deceasedNamePieces) {
        if (namePiece === '' || usedPieces.has(namePiece)) {
            continue;
        }
        usedPieces.add(namePiece);
        sqlWhereClause += ` and instr(lower(${tableAlias}.deceasedName), ?)`;
        sqlParameters.push(namePiece);
    }
    return {
        sqlParameters,
        sqlWhereClause
    };
}
export function getPurchaserNameWhereClause(purchaserName = '', tableAlias = 'c') {
    let sqlWhereClause = '';
    const sqlParameters = [];
    const usedPieces = new Set();
    const purchaserNamePieces = purchaserName.toLowerCase().split(' ');
    for (const namePiece of purchaserNamePieces) {
        if (namePiece === '' || usedPieces.has(namePiece)) {
            continue;
        }
        usedPieces.add(namePiece);
        sqlWhereClause += ` and instr(lower(${tableAlias}.purchaserName), ?)`;
        sqlParameters.push(namePiece);
    }
    return {
        sqlParameters,
        sqlWhereClause
    };
}
