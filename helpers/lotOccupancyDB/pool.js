import { Pool } from 'better-sqlite-pool';
import { lotOccupancyDB as databasePath } from '../../data/databasePaths.js';
import exitHook from 'exit-hook';
const pool = new Pool(databasePath);
export async function acquireConnection() {
    return await pool.acquire();
}
exitHook(() => {
    pool.close();
});
