const isDeletedSqlStatement = `select burialSiteId
  from BurialSites
  where recordDelete_timeMillis is not null`;
const burialSiteTables = [
    'BurialSiteComments',
    'BurialSiteFields',
    'WorkOrderBurialSites',
    'BurialSites'
];
export function purgeBurialSite(burialSiteId, database) {
    // Do not purge burial sites on active contracts
    const activeContract = database
        .prepare(`select contractId
        from Contracts
        where burialSiteId = ?
          and recordDelete_timeMillis is null`)
        .pluck()
        .get(burialSiteId);
    if (activeContract !== undefined) {
        return false;
    }
    // Do not purge burial sites on active work orders
    const activeWorkOrder = database
        .prepare(`select workOrderId
        from WorkOrders
        where workOrderId in (select workOrderId from WorkOrderBurialSites where burialSiteId = ? and recordDelete_timeMillis is null)
          and recordDelete_timeMillis is null`)
        .pluck()
        .get(burialSiteId);
    if (activeWorkOrder !== undefined) {
        return false;
    }
    // Purge the burial site
    for (const tableName of burialSiteTables) {
        database
            .prepare(`delete from ${tableName}
          where burialSiteId = ?
          and burialSiteId in (${isDeletedSqlStatement})`)
            .run(burialSiteId);
    }
    return true;
}
