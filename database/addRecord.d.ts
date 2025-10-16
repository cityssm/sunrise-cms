import sqlite from 'better-sqlite3';
export declare function addBurialSiteStatus(burialSiteStatus: string, orderNumber: number | string, user: User, connectedDatabase?: sqlite.Database): number;
export declare function addWorkOrderMilestoneType(workOrderMilestoneType: string, orderNumber: number | string, user: User, connectedDatabase?: sqlite.Database): number;
export declare function addWorkOrderType(workOrderType: string, orderNumber: number | string, user: User, connectedDatabase?: sqlite.Database): number;
