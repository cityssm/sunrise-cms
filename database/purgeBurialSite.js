const isDeletedSqlStatement = `
  SELECT
    burialSiteId
  FROM
    BurialSites
  WHERE
    recordDelete_timeMillis IS NOT NULL
`;
const burialSiteTables = [
    'BurialSiteComments',
    'BurialSiteFields',
    'WorkOrderBurialSites',
    'BurialSites'
];
export function purgeBurialSite(burialSiteId, database) {
    const activeContract = database
        .prepare(`
      SELECT
        contractId
      FROM
        Contracts
      WHERE
        burialSiteId = ?
        AND recordDelete_timeMillis IS NULL
    `)
        .pluck()
        .get(burialSiteId);
    if (activeContract !== undefined) {
        return false;
    }
    const activeWorkOrder = database
        .prepare(`
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
        .get(burialSiteId);
    if (activeWorkOrder !== undefined) {
        return false;
    }
    for (const tableName of burialSiteTables) {
        database
            .prepare(`
        DELETE FROM ${tableName}
        WHERE
          burialSiteId = ?
          AND burialSiteId IN (${isDeletedSqlStatement})
      `)
            .run(burialSiteId);
    }
    return true;
}
