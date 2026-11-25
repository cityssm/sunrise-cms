export const currentUserVersion = 2;
export const sqlIndexStatements = [
    'CREATE INDEX IF NOT EXISTS idx_BurialSites_cemeteryId ON BurialSites (cemeteryId)',
    'CREATE INDEX IF NOT EXISTS idx_BurialSites_burialSiteTypeId ON BurialSites (burialSiteTypeId)',
    'CREATE INDEX IF NOT EXISTS idx_BurialSites_burialSiteStatusId ON BurialSites (burialSiteStatusId)',
    'CREATE INDEX IF NOT EXISTS idx_Cemeteries_parentCemeteryId ON Cemeteries (parentCemeteryId)',
    'CREATE INDEX IF NOT EXISTS idx_Contracts_burialSiteId ON Contracts (burialSiteId)',
    'CREATE INDEX IF NOT EXISTS idx_Contracts_contractTypeId ON Contracts (contractTypeId)',
    'CREATE INDEX IF NOT EXISTS idx_Contracts_contractStartDate ON Contracts (contractStartDate)',
    'CREATE INDEX IF NOT EXISTS idx_Contracts_contractEndDate ON Contracts (contractEndDate)',
    'CREATE INDEX IF NOT EXISTS idx_Contracts_funeralHomeId ON Contracts (funeralHomeId)',
    'CREATE INDEX IF NOT EXISTS idx_Contracts_funeralDate ON Contracts (funeralDate, funeralTime)',
    'CREATE INDEX IF NOT EXISTS idx_ContractInterments_deceasedName ON ContractInterments (deceasedName)',
    'CREATE INDEX IF NOT EXISTS idx_ContractAttachments_contractId ON ContractAttachments (contractId)',
    'CREATE INDEX IF NOT EXISTS idx_ContractServiceTypes_serviceTypeId ON ContractServiceTypes (serviceTypeId, contractId)',
    'CREATE INDEX IF NOT EXISTS idx_ContractFees_feeId ON ContractFees (feeId, contractId)',
    'CREATE INDEX IF NOT EXISTS idx_RelatedContracts_contractIdB ON RelatedContracts (contractIdB)',
    'CREATE INDEX IF NOT EXISTS idx_OrderForms_isOrderFormProcessed ON OrderForms (isOrderFormProcessed)',
    'CREATE INDEX IF NOT EXISTS idx_WorkOrders_workOrderTypeId ON WorkOrders (workOrderTypeId)',
    'CREATE INDEX IF NOT EXISTS idx_WorkOrders_workOrderStatusId ON WorkOrders (workOrderStatusId)',
    'CREATE INDEX IF NOT EXISTS idx_WorkOrders_workOrderOpenDate ON WorkOrders (workOrderOpenDate)',
    'CREATE INDEX IF NOT EXISTS idx_WorkOrders_workOrderCloseDate ON WorkOrders (workOrderCloseDate)',
    'CREATE INDEX IF NOT EXISTS idx_WorkOrderBurialSites_burialSiteId ON WorkOrderBurialSites (burialSiteId, workOrderId)',
    'CREATE INDEX IF NOT EXISTS idx_WorkOrderContracts_contractId ON WorkOrderContracts (contractId, workOrderId)',
    'CREATE INDEX IF NOT EXISTS idx_WorkOrderMilestones_workOrderId ON WorkOrderMilestones (workOrderId)',
    'CREATE INDEX IF NOT EXISTS idx_WorkOrderMilestones_workOrderMilestoneDate ON WorkOrderMilestones (workOrderMilestoneDate)',
    'CREATE INDEX IF NOT EXISTS idx_WorkOrderMilestones_workOrderMilestoneTypeId ON WorkOrderMilestones (workOrderMilestoneTypeId)'
];
export function getCurrentUserVersion(database) {
    const row = database.prepare('PRAGMA user_version').get();
    return row?.user_version ?? 0;
}
export function hasTableColumn(database, tableName, columnName) {
    const columns = database
        .prepare(`PRAGMA table_info(${tableName})`)
        .all();
    return columns.some((column) => column.name === columnName);
}
