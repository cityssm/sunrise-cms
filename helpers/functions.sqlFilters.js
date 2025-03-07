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
export function getContractTimeWhereClause(contractTime, contractsTableAlias = 'o') {
    let sqlWhereClause = '';
    const sqlParameters = [];
    const currentDateString = dateToInteger(new Date());
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (contractTime ?? '') {
        case 'current': {
            sqlWhereClause += ` and ${contractsTableAlias}.contractStartDate <= ?
        and (${contractsTableAlias}.contractEndDate is null or ${contractsTableAlias}.contractEndDate >= ?)`;
            sqlParameters.push(currentDateString, currentDateString);
            break;
        }
        case 'past': {
            sqlWhereClause +=
                ` and ${contractsTableAlias}.contractEndDate < ?`;
            sqlParameters.push(currentDateString);
            break;
        }
        case 'future': {
            sqlWhereClause +=
                ` and ${contractsTableAlias}.contractStartDate > ?`;
            sqlParameters.push(currentDateString);
            break;
        }
    }
    return {
        sqlWhereClause,
        sqlParameters
    };
}
export function getDeceasedNameWhereClause(deceasedName = '', tableAlias = 'o') {
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
        sqlWhereClause,
        sqlParameters
    };
}
