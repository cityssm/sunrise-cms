export declare function preloadCaches(): void;
export declare const cacheTableNames: readonly ["BurialSiteStatuses", "BurialSiteTypeFields", "BurialSiteTypes", "CommittalTypes", "ContractTypeFields", "ContractTypePrints", "ContractTypes", "FeeCategories", "Fees", "IntermentContainerTypes", "SunriseSettings", "WorkOrderMilestoneTypes", "WorkOrderTypes", "UserSettings"];
export type CacheTableNames = (typeof cacheTableNames)[number];
export declare function clearCacheByTableName(tableName: CacheTableNames, relayMessage?: boolean): void;
export declare function clearCaches(): void;
