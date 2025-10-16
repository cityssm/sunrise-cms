import sqlite from 'better-sqlite3';
export declare function updateBurialSiteStatus(burialSiteStatusId: number | string, burialSiteStatus: string, user: User, connectedDatabase?: sqlite.Database): boolean;
export declare function updateCommittalType(committalTypeId: number | string, committalType: string, user: User, connectedDatabase?: sqlite.Database): boolean;
export declare function updateWorkOrderMilestoneType(workOrderMilestoneTypeId: number | string, workOrderMilestoneType: string, user: User, connectedDatabase?: sqlite.Database): boolean;
export declare function updateWorkOrderType(workOrderTypeId: number | string, workOrderType: string, user: User, connectedDatabase?: sqlite.Database): boolean;
