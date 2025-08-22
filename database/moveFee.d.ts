import sqlite from 'better-sqlite3';
export declare function moveFeeDown(feeId: number | string, connectedDatabase?: sqlite.Database): boolean;
export declare function moveFeeDownToBottom(feeId: number | string, connectedDatabase?: sqlite.Database): boolean;
export declare function moveFeeUp(feeId: number | string, connectedDatabase?: sqlite.Database): boolean;
export declare function moveFeeUpToTop(feeId: number | string, connectedDatabase?: sqlite.Database): boolean;
export default moveFeeUp;
