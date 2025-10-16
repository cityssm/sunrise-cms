import { dateToInteger } from '@cityssm/utils-datetime'

type BurialSiteNameSearchType = '' | 'endsWith' | 'startsWith'

type ContractTime = '' | 'current' | 'future' | 'past'

interface WhereClauseReturn {
  sqlParameters: unknown[]
  sqlWhereClause: string
}

export function getBurialSiteNameWhereClause(
  burialSiteName = '',
  burialSiteNameSearchType: BurialSiteNameSearchType = '',
  burialSitesTableAlias = 'b'
): WhereClauseReturn {
  let sqlWhereClause = ''
  const sqlParameters: unknown[] = []

  if (burialSiteName !== '') {
    switch (burialSiteNameSearchType) {
      case 'endsWith': {
        sqlWhereClause += ` and ${burialSitesTableAlias}.burialSiteName like '%' || ?`
        sqlParameters.push(burialSiteName)
        break
      }
      case 'startsWith': {
        sqlWhereClause += ` and ${burialSitesTableAlias}.burialSiteName like ? || '%'`
        sqlParameters.push(burialSiteName)
        break
      }
      default: {
        const usedPieces = new Set<string>()

        const burialSiteNamePieces = burialSiteName.toLowerCase().split(' ')

        for (const burialSiteNamePiece of burialSiteNamePieces) {
          if (
            burialSiteNamePiece === '' ||
            usedPieces.has(burialSiteNamePiece)
          ) {
            continue
          }

          usedPieces.add(burialSiteNamePiece)

          sqlWhereClause += ` and instr(lower(${burialSitesTableAlias}.burialSiteName), ?)`
          sqlParameters.push(burialSiteNamePiece)
        }
      }
    }
  }

  return {
    sqlParameters,
    sqlWhereClause
  }
}

export function getContractTimeWhereClause(
  contractTime: ContractTime | undefined,
  contractsTableAlias = 'o'
): WhereClauseReturn {
  let sqlWhereClause = ''
  const sqlParameters: unknown[] = []

  const currentDateString = dateToInteger(new Date())

  switch (contractTime ?? '') {
    case 'current': {
      sqlWhereClause += ` and ${contractsTableAlias}.contractStartDate <= ?
        and (${contractsTableAlias}.contractEndDate is null or ${contractsTableAlias}.contractEndDate >= ?)`
      sqlParameters.push(currentDateString, currentDateString)
      break
    }

    case 'future': {
      sqlWhereClause += ` and ${contractsTableAlias}.contractStartDate > ?`
      sqlParameters.push(currentDateString)
      break
    }

    case 'past': {
      sqlWhereClause += ` and ${contractsTableAlias}.contractEndDate < ?`
      sqlParameters.push(currentDateString)
      break
    }

    default: {
      // no default
      break
    }
  }

  return {
    sqlParameters,
    sqlWhereClause
  }
}

export function getDeceasedNameWhereClause(
  deceasedName = '',
  tableAlias = 'ci'
): WhereClauseReturn {
  let sqlWhereClause = ''
  const sqlParameters: unknown[] = []

  const usedPieces = new Set<string>()

  const deceasedNamePieces = deceasedName.toLowerCase().split(' ')
  for (const namePiece of deceasedNamePieces) {
    if (namePiece === '' || usedPieces.has(namePiece)) {
      continue
    }

    usedPieces.add(namePiece)

    sqlWhereClause += ` and instr(lower(${tableAlias}.deceasedName), ?)`
    sqlParameters.push(namePiece)
  }

  return {
    sqlParameters,
    sqlWhereClause
  }
}

export function getPurchaserNameWhereClause(
  purchaserName = '',
  tableAlias = 'c'
): WhereClauseReturn {
  let sqlWhereClause = ''
  const sqlParameters: unknown[] = []

  const usedPieces = new Set<string>()

  const purchaserNamePieces = purchaserName.toLowerCase().split(' ')
  for (const namePiece of purchaserNamePieces) {
    if (namePiece === '' || usedPieces.has(namePiece)) {
      continue
    }

    usedPieces.add(namePiece)

    sqlWhereClause += ` and instr(lower(${tableAlias}.purchaserName), ?)`
    sqlParameters.push(namePiece)
  }

  return {
    sqlParameters,
    sqlWhereClause
  }
}
