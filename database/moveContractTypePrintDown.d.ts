import sqlite from 'better-sqlite3';
export declare function moveContractTypePrintDown(contractTypeId: number | string, printEJS: string, connectedDatabase?: sqlite.Database): boolean;
export declare function moveContractTypePrintDownToBottom(contractTypeId: number | string, printEJS: string, connectedDatabase?: sqlite.Database): boolean;
export default moveContractTypePrintDown;
