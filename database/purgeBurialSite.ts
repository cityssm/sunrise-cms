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
    .prepare(/* sql */ `
      SELECT
        contractId
      FROM
        Contracts
      WHERE
        burialSiteId = ?
        AND recordDelete_timeMillis IS NULL
    `)
    .pluck()
    .get(burialSiteId) as number | undefined

  if (activeContract !== undefined) {
    return false
  }

  // Do not purge burial sites on active work orders

  const activeWorkOrder = database
    .prepare(/* sql */ `
      SELECT
        workOrderId
      FROM
        WorkOrders
      WHERE
        workOrderId IN (
          SELECT
            workOrderId
          FROM
            WorkOrderBurialSites
          WHERE
            burialSiteId = ?
            AND recordDelete_timeMillis IS NULL
        )
        AND recordDelete_timeMillis IS NULL
    `)
    .pluck()
    .get(burialSiteId) as number | undefined

  if (activeWorkOrder !== undefined) {
    return false
  }

  // Purge the burial site

  for (const tableName of burialSiteTables) {
    database
      .prepare(/* sql */ `
        DELETE FROM ${tableName}
        WHERE
          burialSiteId = ?
          AND burialSiteId IN (${isDeletedSqlStatement})
      `)
      .run(burialSiteId)
  }

  return true
}
