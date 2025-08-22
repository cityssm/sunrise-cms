import sqlite from 'better-sqlite3';
export declare function moveContractTypePrintUp(contractTypeId: number | string, printEJS: string, connectedDatabase?: sqlite.Database): boolean;
export declare function moveContractTypePrintUpToTop(contractTypeId: number | string, printEJS: string, connectedDatabase?: sqlite.Database): boolean;
export default moveContractTypePrintUp;
