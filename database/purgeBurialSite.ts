import type sqlite from 'better-sqlite3'

const isDeletedSqlStatement = `select burialSiteId
  from BurialSites
  where recordDelete_timeMillis is not null`

const burialSiteTables = [
  'BurialSiteComments',
  'BurialSiteFields',
  'WorkOrderBurialSites',
  'BurialSites'
]

/**
 * Purge a burial site from the database.
 * Burial sites cannot be purged if they are associated with active contracts or work orders.
 * @param burialSiteId - The ID of the burial site to purge.
 * @param database - The SQLite database connection.
 * @returns True if the burial site was purged, false otherwise.
 */
export function purgeBurialSite(
  burialSiteId: number,
  database: sqlite.Database
): boolean {

  // Do not purge burial sites on active contracts

  const activeContract = database
    .prepare(/* sql */ `select contractId
        from Contracts
        where burialSiteId = ?
          and recordDelete_timeMillis is null`
    )
    .pluck()
    .get(burialSiteId) as number | undefined

  if (activeContract !== undefined) {
    return false
  }

  // Do not purge burial sites on active work orders

  const activeWorkOrder = database
    .prepare(/* sql */ `select workOrderId
        from WorkOrders
        where workOrderId in (select workOrderId from WorkOrderBurialSites where burialSiteId = ? and recordDelete_timeMillis is null)
          and recordDelete_timeMillis is null`
    )
    .pluck()
    .get(burialSiteId) as number | undefined

  if (activeWorkOrder !== undefined) {
    return false
  }

  // Purge the burial site

  for (const tableName of burialSiteTables) {

    database
      .prepare(/* sql */ `delete from ${tableName}
          where burialSiteId = ?
          and burialSiteId in (${isDeletedSqlStatement})`
      )
      .run(burialSiteId)
  }

  return true
}