import { dateToInteger } from '@cityssm/utils-datetime'

type BurialSiteNameSearchType = 'startsWith' | 'endsWith' | ''

interface WhereClauseReturn {
  sqlWhereClause: string
  sqlParameters: unknown[]
}

export function getBurialSiteNameWhereClause(
  burialSiteName = '',
  burialSiteNameSearchType: BurialSiteNameSearchType = '',
  burialSitesTableAlias = 'l'
): WhereClauseReturn {
  let sqlWhereClause = ''
  const sqlParameters: unknown[] = []

  if (burialSiteName !== '') {
    switch (burialSiteNameSearchType) {
      case 'startsWith': {
        sqlWhereClause += ` and ${burialSitesTableAlias}.burialSiteName like ? || '%'`
        sqlParameters.push(burialSiteName)
        break
      }
      case 'endsWith': {
        sqlWhereClause += ` and ${burialSitesTableAlias}.burialSiteName like '%' || ?`
        sqlParameters.push(burialSiteName)
        break
      }
      default: {
        const usedPieces = new Set<string>()

        const burialSiteNamePieces = burialSiteName.toLowerCase().split(' ')

        for (const burialSiteNamePiece of burialSiteNamePieces) {
          if (burialSiteNamePiece === '' || usedPieces.has(burialSiteNamePiece)) {
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
    sqlWhereClause,
    sqlParameters
  }
}

type OccupancyTime = '' | 'current' | 'past' | 'future'

export function getOccupancyTimeWhereClause(
  occupancyTime: OccupancyTime | undefined,
  lotOccupanciesTableAlias = 'o'
): WhereClauseReturn {
  let sqlWhereClause = ''
  const sqlParameters: unknown[] = []

  const currentDateString = dateToInteger(new Date())

  switch (occupancyTime ?? '') {
    case 'current': {
      sqlWhereClause += ` and ${lotOccupanciesTableAlias}.contractStartDate <= ?
        and (${lotOccupanciesTableAlias}.contractEndDate is null or ${lotOccupanciesTableAlias}.contractEndDate >= ?)`
      sqlParameters.push(currentDateString, currentDateString)
      break
    }

    case 'past': {
      sqlWhereClause +=
        ` and ${lotOccupanciesTableAlias}.contractEndDate < ?`
      sqlParameters.push(currentDateString)
      break
    }

    case 'future': {
      sqlWhereClause +=
        ` and ${lotOccupanciesTableAlias}.contractStartDate > ?`
      sqlParameters.push(currentDateString)
      break
    }
  }

  return {
    sqlWhereClause,
    sqlParameters
  }
}

export function getOccupantNameWhereClause(
  occupantName = '',
  tableAlias = 'o'
): WhereClauseReturn {
  let sqlWhereClause = ''
  const sqlParameters: unknown[] = []

  const usedPieces = new Set<string>()

  const occupantNamePieces = occupantName.toLowerCase().split(' ')
  for (const occupantNamePiece of occupantNamePieces) {
    if (occupantNamePiece === '' || usedPieces.has(occupantNamePiece)) {
      continue
    }

    usedPieces.add(occupantNamePiece)

    sqlWhereClause += ` and (instr(lower(${tableAlias}.occupantName), ?) or instr(lower(${tableAlias}.occupantFamilyName), ?))`
    sqlParameters.push(occupantNamePiece, occupantNamePiece)
  }

  return {
    sqlWhereClause,
    sqlParameters
  }
}
